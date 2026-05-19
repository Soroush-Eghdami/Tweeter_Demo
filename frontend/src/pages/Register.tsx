import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import FirstNameInput from "../components/loginRegister/FirstNameInput";
import LastNameInput from "../components/loginRegister/LastNameInput";
import UsernameInput from "../components/loginRegister/UsernameInput";
import EmailInput from "../components/loginRegister/EmailInput";
import PasswordInput from "../components/loginRegister/PasswordInput";
import RepeatPasswordInput from "../components/loginRegister/RepeatPasswordInput";
import Loading from "../components/loading/Loading";
import { useRegister } from "../hooks/useRegister";
import type { RegisterFormType } from "../types/FormTypes";

const Register = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormType>();
  const { mutate, isPending } = useRegister();
  const navigation = useNavigate();

  // Form Validation
  const firstNameValue = watch("firstName");
  const lastNameValue = watch("lastName");
  const usernameValue = watch("username");
  const emailValue = watch("email");
  const passwordValue = watch("password");
  const repeatPasswordValue = watch("repeatPassword");
  const isFormValid =
    !!firstNameValue?.trim() &&
    !!lastNameValue?.trim() &&
    !!usernameValue?.trim() &&
    !!emailValue?.trim() &&
    !!passwordValue?.trim() &&
    !!repeatPasswordValue?.trim();

  const onSubmit = (data: RegisterFormType) => {
    mutate(
      {
        username: data.username,
        password: data.password,
        password2: data.repeatPassword,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
      },
      {
        onSuccess: () => {
          toast.success("User Registered Successfully!");
          navigation("/login");
          reset();
        },
        onError: (error: unknown) => {
          const axiosError = error as {
            response?: { data?: { detail?: Record<string, string[]> } };
          };
          const detail = axiosError?.response?.data?.detail;

          if (detail && typeof detail === "object") {
            const usernameError = detail.username?.[0];
            const emailError = detail.email?.[0];

            if (usernameError || emailError) {
              // Keep the entered values but clear password fields
              const currentValues = getValues();
              reset({
                ...currentValues,
                password: "",
                repeatPassword: "",
              });

              if (usernameError) toast.error("Username already taken.");
              if (emailError) toast.error("Email already registered.");
              return;
            }
          }

          // Fallback for other errors
          toast.error("Registration failed. Please try again.");
        },
      },
    );
  };

  return (
    <>
      <div className="bg-custom-login-gradient min-h-dvh">
        <div className="py-25">
          <form
            className="container flex flex-col items-center justify-center gap-2 max-w-[38.5%] mx-auto text-white rounded-3xl shadow-[0_0px_30px_rgba(0,0,0,0.4)] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5]"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="pt-12 pb-6 px-4 mt-4">
              <p className="text-center text-3xl font-semibold">
                {" "}
                Create your account
              </p>
            </div>
            {/* First Name */}
            <FirstNameInput register={register} error={errors.firstName} />

            {/* Last Name */}
            <LastNameInput register={register} error={errors.lastName} />

            {/* Username */}
            <UsernameInput register={register} error={errors.username} />

            {/* Email */}
            <EmailInput register={register} error={errors.email} />

            <div className="flex flex-wrap justify-start gap-6">
              {/* Password */}
              <div className="max-w-48">
                <PasswordInput register={register} error={errors.password} />
              </div>

              {/* Repeat Password */}
              <div className="max-w-48">
                <RepeatPasswordInput
                  register={register}
                  watch={watch}
                  error={errors.repeatPassword}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !isFormValid}
              className="w-[70%] rounded-xl font-bold px-16 py-3 bg-white text-black mt-12 cursor-pointer hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-[#bbb]"
            >
              {isPending ? <Loading width="w-6" height="h-6" /> : "Register"}
            </button>

            <p className="mb-12">
              Already have an account?{" "}
              <span
                className="underline cursor-pointer hover:text-blue-400"
                onClick={() => navigation("/login")}
              >
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
