"use client";

import { useState } from "react";
import packagesData from "../../../../../../data/packages.json";

export default function CreateBookingPage() {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    packageId: "",
    departureDate: "",
    groupSize: 1,
    bookingType: "physical",
    guide: "",
    status: "pending",
    notes: "",
    totalPrice: "",
    paymentStatus: "pending",
    paymentMethod: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.packageId ||
      !formData.departureDate ||
      formData.groupSize < 1
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    console.log("Booking created:", formData);

    alert("Booking created successfully!");
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <form onSubmit={handleSubmit}>
        <h1 className="text-2xl font-semibold text-gray-900">Create Booking</h1>

        <p className="mt-1 text-sm text-neutral-500">
          Create a booking for a customer.
        </p>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Customer Information
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="customerName"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Customer Name
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter customer name"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              />
            </div>

            <div>
              <label
                htmlFor="customerEmail"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Email
              </label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              />
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Phone Number
              </label>
              <input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              />
            </div>

            <div>
              <label
                htmlFor="bookingType"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Booking Type
              </label>
              <select
                id="bookingType"
                name="bookingType"
                value={formData.bookingType}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              >
                <option value="physical">In-person</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Trek / Package Information
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="packageId"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Package / Trek
              </label>

              <select
                id="packageId"
                name="packageId"
                value={formData.packageId}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              >
                <option value="">Select package</option>
                {packagesData.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="departureDate"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Departure Date
              </label>

              <input
                id="departureDate"
                name="departureDate"
                type="date"
                value={formData.departureDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              />
            </div>

            <div>
              <label
                htmlFor="groupSize"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Number of People
              </label>

              <input
                id="groupSize"
                name="groupSize"
                type="number"
                min="1"
                value={formData.groupSize}
                onChange={handleChange}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Booking Details
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="guide"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Guide
              </label>

              <select
                id="guide"
                name="guide"
                value={formData.guide}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              >
                <option value="">Select guide</option>
                <option value="guide-001">Guide 1</option>
                <option value="guide-002">Guide 2</option>
                <option value="guide-003">Guide 3</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Booking Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="notes"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Special Requirements / Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Enter any special requirements or notes"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Information
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="totalPrice"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Total Price
              </label>

              <input
                id="totalPrice"
                name="totalPrice"
                type="number"
                min="0"
                value={formData.totalPrice}
                onChange={handleChange}
                placeholder="Enter total price"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              />
            </div>

            <div>
              <label
                htmlFor="paymentStatus"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Payment Status
              </label>

              <select
                id="paymentStatus"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partially Paid</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="paymentMethod"
                className="mb-1 block text-sm font-medium text-neutral-700"
              >
                Payment Method
              </label>

              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900"
              >
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="min-h-[44px] rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="min-h-[44px] rounded-xl bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            Create Booking
          </button>
        </div>
      </form>
    </div>
  );
}
