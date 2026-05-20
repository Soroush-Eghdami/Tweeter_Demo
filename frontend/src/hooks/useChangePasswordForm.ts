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
    reValidateMode: "onChange"
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
            toast.error(
              "You have used this password recently. Please choose a different one.",
            );
            return;
          }
          if (errorMessage === "Old password is incorrect.") {
            toast.error("Old password is incorrect.");
            return;
          }
          toast.error("Something went wrong");
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
