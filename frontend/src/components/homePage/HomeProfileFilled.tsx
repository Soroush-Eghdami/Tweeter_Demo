interface HomeProfileFilledPropsType {
  title: string;
  number: number;
  textColor: string;
  bgColor: string;
}

const HomeProfileFilled = ({
  title,
  number,
  textColor = "text-white",
  bgColor = "bg-black",
}: HomeProfileFilledPropsType) => {
  return (
    <div
      className={`${textColor} ${bgColor} rounded-2xl text-center px-2 py-3 hover:scale-105 transition-all duration-200 ease-in-out`}
    >
      <p className="text-lg">{number}</p>
      <p className="font-medium text-lg">{title}</p>
    </div>
  );
};

export default HomeProfileFilled;
