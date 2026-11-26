import { useState } from 'react';

interface Options {
  stock: number;
  price: number;
  available: boolean;
}

export function useProductQuantity({
  stock,
  price,
  available,
}: Options) {
  const maxQuantity = available
    ? Math.max(0, Math.floor(stock))
    : 0;

  const [requestedQuantity, setRequestedQuantity] =
    useState(1);

  const quantity =
    maxQuantity === 0
      ? 0
      : Math.min(
          Math.max(1, requestedQuantity),
          maxQuantity,
        );

  const canIncrease =
    quantity < maxQuantity;

  const canDecrease =
    quantity > 1;

  function increase() {
    if (!canIncrease) return;

    setRequestedQuantity(quantity + 1);
  }

  function decrease() {
    if (!canDecrease) return;

    setRequestedQuantity(quantity - 1);
  }

  function setQuantity(value: number) {
    if (!Number.isFinite(value)) return;

    if (maxQuantity === 0) {
      setRequestedQuantity(1);
      return;
    }

    setRequestedQuantity(
      Math.min(
        Math.max(1, Math.floor(value)),
        maxQuantity,
      ),
    );
  }

  function reset() {
    setRequestedQuantity(1);
  }

  return {
    quantity,
    maxQuantity,
    canIncrease,
    canDecrease,
    increase,
    decrease,
    setQuantity,
    reset,
    totalPrice: price * quantity,
  };
}