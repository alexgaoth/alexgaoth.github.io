const MainPageFooter = ({ style }) => (
  <div style={{ ...style, paddingTop: '3rem' }}>
    <a
      href="/about"
      className="art-strip"
    >
      <span className="art-strip-label">#contact</span>
      <span className="art-strip-desc">reach out || stay up to date</span>
      <span className="art-strip-arrow">→</span>
    </a>
    <div className="footer">
      <p>this page is written with React @2022 (now deprecated)</p>
      <p>No rights reserved – this work by alex is free to use for any purpose.</p>
    </div>
  </div>
);

export default MainPageFooter;
