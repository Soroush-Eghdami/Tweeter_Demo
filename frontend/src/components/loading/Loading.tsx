interface LoadingPropsType {
  width?: string;
  height?: string;
}

const Loading = ({ width = "w-14", height = "h-14" }: LoadingPropsType) => {
  return (
    <div
      className={`${width} ${height} mx-auto border-4 border-gray-600 border-t-white rounded-full animate-spin `}
    />
  );
};

export default Loading;
