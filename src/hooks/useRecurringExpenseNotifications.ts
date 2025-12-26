import { useEffect } from "react";
import { toast } from "sonner";
import { addMonths, isWithinInterval, startOfDay, format } from "date-fns";
import { Expense } from "@/types";

const NOTIFICATION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // Don't show same notification more than once per day

interface NotificationState {
  [expenseId: string]: number; // Stores timestamp of last notification
}

export const useRecurringExpenseNotifications = (expenses: Expense[]) => {
  useEffect(() => {
    const now = startOfDay(new Date());
    const notificationState: NotificationState = JSON.parse(localStorage.getItem('recurringExpenseNotifications') || '{}');

    expenses.forEach((expense) => {
      if (expense.isRecurring && expense.nextDueDate) {
        const nextDueDate = startOfDay(expense.nextDueDate);

        // Check if the expense is due within the notification window
        const isDueSoon = isWithinInterval(nextDueDate, {
          start: now,
          end: addMonths(now, 1), // Check for expenses due in the next month
        });

        if (isDueSoon) {
          // Check if a notification has been shown recently for this expense
          const lastNotified = notificationState[expense.id] || 0;
          if (now.getTime() - lastNotified > NOTIFICATION_COOLDOWN_MS) {
            toast.info(
              `Upcoming Recurring Expense: ${expense.description || expense.category} of ${expense.amount.toFixed(2)} is due on ${format(nextDueDate, "PPP")}.`,
              {
                duration: 10000, // Keep toast visible for 10 seconds
                id: `recurring-expense-${expense.id}-${nextDueDate.toISOString()}`, // Unique ID for this specific notification
              }
            );

            // Update notification state
            notificationState[expense.id] = now.getTime();
            localStorage.setItem('recurringExpenseNotifications', JSON.stringify(notificationState));
          }
        }
      }
    });
  }, [expenses]);
};