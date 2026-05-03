import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import UsernameInput from "../components/loginRegister/UsernameInput";
import PasswordInput from "../components/loginRegister/PasswordInput";
import type { LoginFormType } from "../types/FormTypes";

const Login = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormType>();
  const navigation = useNavigate();

  const onSubmit = (data: LoginFormType) => {
    console.log(data);
    navigation("/");
    reset();
  };

  return (
    <div className="bg-custom-login-gradient min-h-dvh">
      <div className="pt-32">
        <form
          className="container flex flex-col items-center justify-center gap-2 text-white max-w-[30%] mx-auto rounded-3xl shadow-[0_0px_30px_rgba(0,0,0,0.4)] backdrop-filter-md backdrop-blur-[35px] backdrop-brightness-[1.5]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <p className="text-center text-3xl font-semibold pt-12 pb-8 px-4 mt-4">
            Welcome!
          </p>

          {/* Username */}
          <UsernameInput register={register} />
          {/* Password */}
          <div className="w-[70%]">
            <PasswordInput register={register} />
          </div>

          <button className="w-[70%] rounded-xl font-bold px-16 py-3 bg-white text-black mt-12 cursor-pointer hover:bg-gray-200">
            Login
          </button>
          <p className="mb-14">
            Don't have an account?{" "}
            <span
              className="underline cursor-pointer hover:text-blue-400"
              onClick={() => navigation("/register")}
            >
              Register Now
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
