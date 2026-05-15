import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEditProfile } from "../useEditProfile";
import type {
  EditProfileFormType,
  EditProfileResponse,
} from "../../types/FormTypes";

type FieldErrorRecord = Record<string, string[]>;

interface UseEditProfileFormProps {
  profile: EditProfileResponse | undefined;
}

export const useEditProfileForm = ({ profile }: UseEditProfileFormProps) => {
  const navigate = useNavigate();
  const { mutate: mutateProfile, isPending } = useEditProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    getValues,
    reset,
  } = useForm<EditProfileFormType>({
    defaultValues: {
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      username: profile?.username || "",
      email: profile?.email || "",
      bio: profile?.bio || "",
      is_private: profile ? !profile.is_public_user : false,
    },
  });

  const onSubmit = (data: EditProfileFormType) => {
    const payload: Partial<{
      first_name: string;
      last_name: string;
      username: string;
      email: string;
      bio: string;
      is_public_user: boolean;
    }> = {};

    if (dirtyFields.firstName) payload.first_name = data.firstName;
    if (dirtyFields.lastName) payload.last_name = data.lastName;
    if (dirtyFields.username) payload.username = data.username;
    if (dirtyFields.email) payload.email = data.email;
    if (dirtyFields.bio) payload.bio = data.bio;
    if (dirtyFields.is_private) payload.is_public_user = !data.is_private;

    if (Object.keys(payload).length === 0) {
      toast("No changes detected.");
      return;
    }

    mutateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        navigate("/profile");
      },
      onError: (error: unknown) => {
        console.error(error);

        let fieldErrors: FieldErrorRecord | undefined;
        const maybeAxiosError = error as { response?: { data?: unknown } };
        const data = maybeAxiosError?.response?.data;

        if (data && typeof data === "object" && !Array.isArray(data)) {
          const detail = (data as Record<string, unknown>).detail;
          if (detail && typeof detail === "object" && !Array.isArray(detail)) {
            fieldErrors = detail as FieldErrorRecord;
          } else if (
            "errors" in data &&
            typeof data.errors === "object" &&
            !Array.isArray(data.errors)
          ) {
            fieldErrors = data.errors as FieldErrorRecord;
          } else {
            const possibleErrors: FieldErrorRecord = {};
            let hasFieldError = false;
            for (const key in data as Record<string, unknown>) {
              const value = (data as Record<string, unknown>)[key];
              if (
                Array.isArray(value) &&
                value.every((item) => typeof item === "string")
              ) {
                possibleErrors[key] = value as string[];
                hasFieldError = true;
              }
            }
            if (hasFieldError) fieldErrors = possibleErrors;
          }
        }

        if (fieldErrors) {
          if (fieldErrors.username || fieldErrors.email) {
            const currentValues = getValues();
            if (fieldErrors.username)
              currentValues.username = profile!.username;
            if (fieldErrors.email) currentValues.email = profile!.email;
            reset(currentValues);
            toast.error("That username or email is already taken.");
          } else {
            const firstError = Object.values(fieldErrors).flat().join(", ");
            toast.error(
              firstError || "Update failed. Please check your inputs.",
            );
          }
        } else {
          toast.error("Update failed. Please try again.");
        }
      },
    });
  };

  return {
    register,
    handleSubmit,
    errors,
    isPending,
    onSubmit,
  };
};
