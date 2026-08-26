import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FeedbackBanner } from "@/components/FeedbackBanner";

describe("FeedbackBanner", () => {
  it("renders nothing when there is no error or message", () => {
    const { container } = render(<FeedbackBanner error={null} message={null} onDismiss={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders error message and dismisses on click", () => {
    const onDismiss = vi.fn();
    render(<FeedbackBanner error="Transaction failed" message={null} onDismiss={onDismiss} />);
    expect(screen.getByText("Transaction failed")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("renders success message", () => {
    render(<FeedbackBanner error={null} message="Tip sent successfully!" onDismiss={() => {}} />);
    expect(screen.getByText("Tip sent successfully!")).toBeInTheDocument();
  });
});
