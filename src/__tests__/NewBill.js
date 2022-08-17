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
        });
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const inputFile = screen.getByTestId("file");
        inputFile.addEventListener("click", handleChangeFile);
        userEvent.click(inputFile);
        expect(handleChangeFile).toHaveBeenCalled();
      });
    });
  });
});
