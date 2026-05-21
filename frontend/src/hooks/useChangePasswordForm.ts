import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api-services/api";

export interface ChangePasswordFormType {
  oldPassword: string;
  newPassword: string;
  repeatPassword: string;
}

interface UseChangePasswordFormProps {
  setIsOpen: (value: boolean) => void;
}

const changePasswordRequest = async (data: {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}) => {
  const response = await api.post("/accounts/profile/change-password/", data);
  return response.data;
};


const toastStateMap = new Map<string, { count: number; timer: ReturnType<typeof setTimeout> | null }>();

const limitedToastError = (message: string, id?: string, limit: number = 3, intervalMs: number = 3000) => {
  const key = id || message;
  const state = toastStateMap.get(key);
  const currentCount = state?.count || 0;

  if (currentCount < limit) {
    toast.error(message);
    
    if (state) {
      state.count += 1;
      if (state.timer) clearTimeout(state.timer);
      state.timer = setTimeout(() => {
        toastStateMap.delete(key);
      }, intervalMs);
    } else {
      const timer = setTimeout(() => {
        toastStateMap.delete(key);
      }, intervalMs);
      toastStateMap.set(key, { count: 1, timer });
    }
  }
};

export const useChangePasswordForm = ({
  setIsOpen,
}: UseChangePasswordFormProps) => {
  const { mutate, isPending } = useMutation({
    mutationFn: changePasswordRequest,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ChangePasswordFormType>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      repeatPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  });

  const onSubmit = (data: ChangePasswordFormType) => {
    if (data.newPassword !== data.repeatPassword) {
      setError("repeatPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    mutate(
      {
        old_password: data.oldPassword,
        new_password: data.newPassword,
        confirm_new_password: data.repeatPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password changed successfully!");
          reset();
          setIsOpen(false);
        },
        onError: (error: unknown) => {
          console.error(error);
          const maybeAxiosError = error as {
            response?: {
              data?: {
                error?: string;
              };
            };
          };

          const errorMessage = maybeAxiosError?.response?.data?.error;

          if (
            errorMessage ===
            "You have used this password recently. Please choose a different one."
          ) {
            limitedToastError(
              "You have used this password recently. Please choose a different one.",
              "recent-password");
            return;
          }
          if (errorMessage === "Old password is incorrect.") {
            limitedToastError("Old password is incorrect.", "old-password-error");
            return;
          }
          limitedToastError("Something went wrong", "general-error");
        },
      },
    );
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isPending,
  };
};
