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

type FieldErrorRecord = Record<string, string[]>;

const changePasswordRequest = async (data: {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}) => {
  const response = await api.post("/accounts/profile/change-password/", data);
  return response.data;
};

export const useChangePasswordForm = ({ setIsOpen }: UseChangePasswordFormProps) => {
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
  });

  const onSubmit = (data: ChangePasswordFormType) => {

    if (data.oldPassword === data.newPassword) {
      toast.error("All 3 passwords cannot be the same!");
      return;
    }

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
                detail?: FieldErrorRecord;
              };
            };
          };
          const detail = maybeAxiosError?.response?.data?.detail;

          if (detail?.old_password) {
            setError("oldPassword", {
              type: "server",
              message: detail.old_password[0],
            });
            return;
          }
          if (detail?.new_password) {
            setError("newPassword", {
              type: "server",
              message: detail.new_password[0],
            });
            return;
          }
          if (detail?.confirm_new_password) {
            setError("repeatPassword", {
              type: "server",
              message: detail.confirm_new_password[0],
            });
            return;
          }
          toast.error("Something went wrong...");
        },
      }
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