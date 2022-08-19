/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

import router from "../app/Router.js";
import { get } from "jquery";
import store from "../__mocks__/store";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });
  describe("When I am on Bills page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
  describe("When I am on Bills Page", () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon);
    });
    test("Then, bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  describe("When I click on the icon eye", () => {
    test("Then, a modale should open", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const bill = new Bills({
        document,
        onNavigate,
      });
      const eyeIcon = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn(bill.handleClickIconEye(eyeIcon));
      eyeIcon.addEventListener("click", handleClickIconEye);
      fireEvent.click(eyeIcon);
      expect(handleClickIconEye).toHaveBeenCalled();
      const modale = screen.getByTestId("modaleFile");
      expect(modale).toBeTruthy;
    });
  });
  describe("When I click on the button NewBill", () => {
    test("Then, it should render the page NewBill", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localstorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const bill = new Bills({ document, onNavigate });
      const handleClickNewBill = jest.fn(bill.handleClickNewBill);
      const buttonNewBill = screen.getByTestId("btn-new-bill");
      buttonNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(buttonNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
    });
  });
});

/* test d'intégration GET*/
describe("Given I'm a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(mockStore, "bills");
      const bills = await mockStore.bills();
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
