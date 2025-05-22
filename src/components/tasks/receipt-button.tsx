"use client";

import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { Task } from "@/types/task";

interface ReceiptButtonProps {
  task: Task;
}

export function ReceiptButton({ task }: ReceiptButtonProps) {
  const generateReceipt = () => {
    // Create a new window for the receipt
    const receiptWindow = window.open("", "_blank");
    if (!receiptWindow) return;

    // Format date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    };

    // Generate receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laundry Receipt - ${task.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .receipt {
            border: 1px solid #ccc;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .info {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .items {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          .total {
            margin-top: 20px;
            text-align: right;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .paid-stamp {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 72px;
            color: rgba(0, 128, 0, 0.2);
            border: 10px solid rgba(0, 128, 0, 0.2);
            padding: 10px;
            border-radius: 10px;
            pointer-events: none;
            z-index: 100;
          }
          @media print {
            body {
              padding: 0;
            }
            .receipt {
              border: none;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>Laundry Service Receipt</h1>
            <p>Receipt #: ${task.id.slice(-8)}</p>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span><strong>Customer:</strong></span>
              <span>${task.customer.name}</span>
            </div>
            <div class="info-row">
              <span><strong>Room:</strong></span>
              <span>${task.customer.roomNumber || "N/A"}</span>
            </div>
            <div class="info-row">
              <span><strong>Date:</strong></span>
              <span>${formatDate(task.createdAt)}</span>
            </div>
            <div class="info-row">
              <span><strong>Due Date:</strong></span>
              <span>${formatDate(task.dueDate)}</span>
            </div>
          </div>
          
          <div class="items">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Details</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Laundry Service</td>
                  <td>${task.weight ? task.weight + " kg" : "N/A"} (${task.items} items)</td>
                  <td>₱${
                    task.weight && task.weight <= 4
                      ? "100.00"
                      : (task.weight || 0) > 4
                      ? (100 + ((task.weight || 0) - 4) * 25).toFixed(2)
                      : "0.00"
                  }</td>
                </tr>
                ${
                  task.hasBlankets
                    ? `
                <tr>
                  <td>Blanket Service</td>
                  <td>${task.blanketCount} blanket${task.blanketCount !== 1 ? "s" : ""}</td>
                  <td>₱${(task.blanketCount * 50).toFixed(2)}</td>
                </tr>
                `
                    : ""
                }
              </tbody>
            </table>
          </div>
          
          <div class="total">
            <p>Total: ₱${task.totalPrice?.toFixed(2) || "0.00"}</p>
            <p>Status: ${task.isPaid ? "PAID" : "UNPAID"}</p>
          </div>
          
          ${task.isPaid ? '<div class="paid-stamp">PAID</div>' : ""}
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>For questions or concerns, please contact the front desk.</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()">Print Receipt</button>
        </div>
      </body>
      </html>
    `;

    // Write the HTML to the new window
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  };

  return (
    <Button onClick={generateReceipt} variant="outline" size="sm">
      <Receipt className="h-4 w-4 mr-2" />
      Print Receipt
    </Button>
  );
}
