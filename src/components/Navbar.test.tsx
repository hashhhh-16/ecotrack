import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "./Navbar";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    signOut: vi.fn(),
  }),
}));

describe("Navbar", () => {
  it("renders EcoTrack logo", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText("EcoTrack")).toBeInTheDocument();
  });

  it("shows login button", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });

  it("shows get started button", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/get started/i)).toBeInTheDocument();
  });
});