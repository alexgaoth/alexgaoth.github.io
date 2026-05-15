import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import ResumePage from './components/ResumePage';
import ProjectsPage from './components/ProjectsPage';
import ThoughtsPage from './components/ThoughtsPage';
import QuotesPage from './components/QuotesPage';
import NowPage from './components/NowPage';
import ThoughtArticlePage from './components/ThoughtArticlePage';
import RegentsPage from './components/RegentsPage';
import PoetryCollectionPage from './components/PoetryCollectionPage';
import CiCollectionPage from './components/CiCollectionPage';
import ArtPage from './components/ArtPage';
import ScrollToTop from './components/ScrollToTop';
import { APP_ROUTES } from './config/site';
import { content } from './data/content';
import './styles/global.css';
import './styles/components.css';
import './styles/bookshelf.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path={APP_ROUTES.home} element={<MainPage content={content} />} />
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
