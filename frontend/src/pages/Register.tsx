import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import NameInput from "../components/loginRegister/NameInput";
import UsernameInput from "../components/loginRegister/UsernameInput";
import EmailInput from "../components/loginRegister/EmailInput";
import PasswordInput from "../components/loginRegister/PasswordInput";
import RepeatPasswordInput from "../components/loginRegister/RepeatPasswordInput";
import type { RegisterFormType } from "../types/FormTypes";
import { useRegister } from "../hooks/useRegister";

const Register = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RegisterFormType>();
  const { mutate } = useRegister();
  const navigation = useNavigate();

  const onSubmit = (data: RegisterFormType) => {
    mutate(
      {
        username: data.username,
        password: data.password,
        password2: data.repeatPassword,
        email: data.email,
        first_name: data.name,
      },
      {
        onSuccess: () => {
          toast.success("User Registered Successfully!");
          navigation("/login");
        },
        onError: (errors) => {
          toast.error("Registration Failed!");
          console.log(errors);
        },
      },
    );

    reset();
  };

  // const onError = (errors) => {
  //   console.log(errors);
  // };

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
            {/* Name */}
            <NameInput register={register} />

            {/* Username */}
            <UsernameInput register={register} />

            {/* Email */}
            <EmailInput register={register} />

            <div className="flex flex-wrap justify-center items-center gap-6">
              {/* Password */}
              <div className="max-w-48">
                <PasswordInput register={register} />
              </div>

              {/* Repeat Password */}
              <div className="max-w-48">
                <RepeatPasswordInput register={register} watch={watch} />
              </div>
            </div>

            <button className="w-[70%] rounded-xl font-bold px-16 py-3 bg-white text-black mt-12 cursor-pointer hover:bg-gray-200">
              Register
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
