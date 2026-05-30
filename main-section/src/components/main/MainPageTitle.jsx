const MainPageTitle = ({ sectionRef, style, subtitleOpacity }) => (
  <div
    ref={sectionRef}
    className="title-section-parallax"
    style={style}
  >
    <h1 className="title-main">this is alex gaoth&apos;s directory</h1>
    <div className="title-sub" style={{ opacity: subtitleOpacity, paddingTop: '0.4rem' }}>
      <p>I am alex gao, the additional &apos;th&apos; is here so you can find me easier</p>
      <p className="reverse-hidden">&apos;th&apos; is the initials of my chinese first name, and u can find me elsewhere all by alexgaoth</p>
      <p className="hidden">mobile-first redesign coming — works better on desktop for now</p>
    </div>
  </div>
);

export default MainPageTitle;
