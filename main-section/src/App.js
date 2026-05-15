import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { APP_ROUTES } from './config/site';
import { content } from './data/content';
import ArtPage from './pages/ArtPage';
import CiCollectionPage from './pages/CiCollectionPage';
import MainPage from './pages/MainPage';
import NowPage from './pages/NowPage';
import PoetryCollectionPage from './pages/PoetryCollectionPage';
import ProfilePage from './pages/ProfilePage';
import ProjectsPage from './pages/ProjectsPage';
import QuotesPage from './pages/QuotesPage';
import RegentsPage from './pages/RegentsPage';
import ResumePage from './pages/ResumePage';
import ThoughtArticlePage from './pages/ThoughtArticlePage';
import ThoughtsPage from './pages/ThoughtsPage';
import './styles/global.css';
import './styles/components.css';
import './styles/bookshelf.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path={APP_ROUTES.home} element={<MainPage content={content} />} />
        <Route path={APP_ROUTES.about} element={<ProfilePage />} />
        <Route path={APP_ROUTES.resume} element={<ResumePage data={content.resume} />} />
        <Route path={APP_ROUTES.projects} element={<ProjectsPage data={content.projects} />} />
        <Route path={APP_ROUTES.thoughts} element={<ThoughtsPage data={content.thoughts} />} />
        <Route path={`${APP_ROUTES.thoughts}/:slug`} element={<ThoughtArticlePage />} />
        <Route path={APP_ROUTES.quotes} element={<QuotesPage data={content.quotes} />} />
        <Route path={APP_ROUTES.now} element={<NowPage />} />
        <Route path={APP_ROUTES.art} element={<ArtPage />} />
        <Route path={APP_ROUTES.regents} element={<RegentsPage />} />
        <Route path={APP_ROUTES.poetry} element={<PoetryCollectionPage lang="zh" />} />
        <Route path={APP_ROUTES.poetryEn} element={<PoetryCollectionPage lang="en" />} />
        <Route path={APP_ROUTES.ci} element={<CiCollectionPage lang="zh" />} />
        <Route path={APP_ROUTES.ciEn} element={<CiCollectionPage lang="en" />} />
      </Routes>
    </Router>
  );
}

export default App;
