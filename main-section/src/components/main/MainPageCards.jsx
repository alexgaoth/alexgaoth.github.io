import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../config/site';

const CARD_DESCRIPTIONS = {
  resume: 'My professional experience and skills',
  projects: 'Creative projects funded by my relentless mind',
  thoughts: 'Ideas worth saying - maybe worth reading',
  quotes: 'The good and the bad',
};

const MainPageCards = ({ content, style }) => (
  <div
    className="cards-section-parallax"
    style={style}
  >
    <div className="grid-2col">
      {Object.entries(content).map(([key, data]) => (
        <Link
          key={key}
          to={`/${key}`}
          className="card"
        >
          <div className="card-image">
            <img
              src={process.env.PUBLIC_URL + data.previewImage}
              alt={`${data.title} preview`}
            />
          </div>
          <h2 className="title-card">{data.title}</h2>
          <p className="card-description">{CARD_DESCRIPTIONS[key]}</p>
        </Link>
      ))}
    </div>

    <Link
      to={APP_ROUTES.art}
      className="art-strip"
    >
      <span className="art-strip-label">/art</span>
      <span className="art-strip-desc">the other side of the directory</span>
      <span className="art-strip-arrow">→</span>
    </Link>
  </div>
);

export default MainPageCards;
