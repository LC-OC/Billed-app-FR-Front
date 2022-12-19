import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    $("#modaleFile")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;' class="bill-proof-container"><img id="billNullImg" width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
      );
    if (typeof $("#modaleFile").modal === "function")
      $("#modaleFile").modal("show");
    if (billUrl == "http://localhost:5678/null") {
      let imgBillError = document.getElementById("billNullImg");
      imgBillError.src = "";
      imgBillError.alt = "Format du justificatif invalide";
    }
  };

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          console.log(snapshot);
          snapshot = snapshot.filter(function (a) {
            return a.name !== null;
          });
          snapshot.map((e) => {
            if (e.fileName == "null") {
              e.fileName = "Format du justificatif invalide";
            }
          });
          const bills = snapshot
            //  test => bills should be ordered from earliest to latest
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            //
            .map((doc) => {
              try {
                return {
                  ...doc,
                  date: formatDate(doc.date),
                  status: formatStatus(doc.status),
                };
              } catch (e) {
                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                // log the error and return unformatted date in that case
                console.log(e, "for", doc);
                return {
                  ...doc,
                  date: doc.date,
                  status: formatStatus(doc.status),
                };
              }
            });
          console.log("length", bills.length);
          return bills;
        });
    }
  };
}
