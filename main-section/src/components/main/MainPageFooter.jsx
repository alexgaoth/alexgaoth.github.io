import { Link } from "react-router-dom";
import { APP_ROUTES, SITE } from "../../config/site";

const MainPageFooter = ({ style }) => (
  <div className="mainpage-footer" style={style}>
    <Link to={APP_ROUTES.art} className="art-strip mainpage-footer-strip">
      <span className="art-strip-label">/art</span>
      <span className="art-strip-desc">the other side of the directory</span>
      <span className="art-strip-arrow">→</span>
    </Link>
    <Link
      to={APP_ROUTES.about}
      className="art-strip mainpage-footer-strip"
      style={{ marginTop: "0.5rem" }}
    >
      <span className="art-strip-label">/about</span>
      <span className="art-strip-desc">compiled version of the site</span>
      <span className="art-strip-arrow">→</span>
    </Link>
    <a
      href={SITE.personalUrl}
      className="art-strip mainpage-footer-strip"
      style={{ marginTop: "0.5rem" }}
    >
      <span className="art-strip-label">#contact</span>
      <span className="art-strip-desc">reach out and stay up to date</span>
      <span className="art-strip-arrow">→</span>
    </a>
    <div className="footer">
      <p>this page is written with React @2022 (now deprecated)</p>
      <p>
        No rights reserved – this work by alex is free to use for any purpose.
      </p>
    </div>
  </div>
);

export default MainPageFooter;
