import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import Home from "./components/Home";
import AllPrizes from "./components/AllPrizes";
import About from "./components/About";
import Story from "./components/Story";
import Suggestions from "./components/Suggestions";
import reportWebVitals from "./reportWebVitals";
import AdminDashboard from './components/AdminDashboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/admin",
        element: <AdminDashboard />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/story",
        element: <Story />,
      },
      {
        path: "/suggestions",
        element: <Suggestions />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
