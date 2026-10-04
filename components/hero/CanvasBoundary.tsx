"use client";

import { Component, type ReactNode } from "react";

type Props = { fallback: ReactNode; onError?: () => void; children: ReactNode };

/** If the GPU context cannot be created, show the still instead of an empty stage. */
export class CanvasBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
