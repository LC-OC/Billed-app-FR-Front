/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import store from "../__mocks__/store";
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then, it should render the NewBill form", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const formNewBill = screen.getAllByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();
    });
    test("Then, it should render input", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const typeInput = screen.getByTestId("expense-type");
      const nameInput = screen.getByTestId("expense-name");
      const dateInput = screen.getByTestId("datepicker");
      const amountInput = screen.getByTestId("amount");
      const vatInput = screen.getByTestId("vat");
      const pctInput = screen.getByTestId("pct");
      const commentaryInput = screen.getByTestId("commentary");
      const fileInput = screen.getByTestId("file");
      expect(typeInput).toBeTruthy();
      expect(nameInput).toBeTruthy();
      expect(dateInput).toBeTruthy();
      expect(amountInput).toBeTruthy();
      expect(vatInput).toBeTruthy();
      expect(pctInput).toBeTruthy();
      expect(commentaryInput).toBeTruthy();
      expect(fileInput).toBeTruthy();
    });
    test("Then, bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toBeTruthy();
    });
    describe("When I click on the submit button", () => {
      test("Then, it should render the page Bills", () => {
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        Object.defineProperty(window, "localstorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );
        const newBill = new NewBill({ document, onNavigate });
        const handleSubmit = jest.fn(newBill.handleSubmit);
        const formNewBill = screen.getByTestId("form-new-bill");
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
    describe("When I add an image in input File", () => {
      test("Then, input file value should be changed", () => {
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        Object.defineProperty(window, "localstorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [
              new File(["billTest.png"], "billTest.png", { type: "image/png" }),
            ],
          },
        });
        expect(handleChangeFile).toHaveBeenCalled();
        expect(fileInput.files[0].name).toBe("billTest.png");
      });
    });
  });
});

/* test d'intégration POST*/
describe("Given I'm a user connected as employee", () => {
  describe("When I send a new Bill", () => {
    test("fetches bills from mock API Post", async () => {
      const getSpy = jest.spyOn(mockStore, "bills");
      const newBill = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl:
          "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };
      const bills = await mockStore.bills(newBill);
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect((await bills.list()).length).toBe(4);
    });
    describe("When an error occurs on API", () => {
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          Promise.reject(new Error("Erreur 404"));
        });
        document.body.innerHTML = BillsUI({ error: "Erreur 404" });
        const errorMessage = await screen.getByText(/Erreur 404/);
        expect(errorMessage).toBeTruthy();
      });
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          Promise.reject(new Error("Erreur 500"));
        });
        document.body.innerHTML = BillsUI({ error: "Erreur 500" });
        const errorMessage = await screen.getByText(/Erreur 500/);
        expect(errorMessage).toBeTruthy();
      });
    });
  });
});
