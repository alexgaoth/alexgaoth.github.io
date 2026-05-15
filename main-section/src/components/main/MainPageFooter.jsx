import { Link } from 'react-router-dom';
import { APP_ROUTES, SITE } from '../../config/site';

const MainPageFooter = ({ style }) => (
  <div style={{ ...style, paddingTop: '3rem' }}>
    <a
      href={SITE.personalUrl}
      className="art-strip"
    >
      <span className="art-strip-label">#contact</span>
      <span className="art-strip-desc">reach out || stay up to date</span>
      <span className="art-strip-arrow">→</span>
    </a>
    <Link
      to={APP_ROUTES.about}
      className="art-strip"
      style={{ marginTop: '0.5rem' }}
    >
      <span className="art-strip-label">about</span>
      <span className="art-strip-desc">who i am || names, identity, and links</span>
      <span className="art-strip-arrow">→</span>
    </Link>
    <div className="footer">
      <p>this page is written with React @2022 (now deprecated)</p>
      <p>No rights reserved – this work by alex is free to use for any purpose.</p>
    </div>
  </div>
);

export default MainPageFooter;
