const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <div id="footer" className="h-full py-8">
      <p className="text-[#ddd] text-center mt-12">
        all rights reserved &copy; {year}
      </p>
    </div>
  );
};

export default Footer;
