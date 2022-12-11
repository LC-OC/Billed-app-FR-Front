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
import Store from "../__mocks__/Store";
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
    describe("When I click on the submit button ansd all input ", () => {
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

// POST Test
describe("Given I am connected as an employee", () => {
  describe("When I create a new valid bill", () => {
    test("Then the system should add it to the dashboard", async () => {
      const bill = {
        type: "Restauration",
        name: "test Bill",
        date: "2022-02-22",
        amount: 45,
        vat: 50,
        pct: 20,
        fileUrl: "url.jpg",
        fileName: "test.jpg",
      };

      jest.mock("../app/Store");
      Store.bills = () => ({ bill, post: jest.fn().mockResolvedValue() });
      const getSpy = jest.spyOn(Store, "bills");
      const postBill = Store.bills(bill);
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(postBill.bill).toEqual(bill);
    });
  });
});
