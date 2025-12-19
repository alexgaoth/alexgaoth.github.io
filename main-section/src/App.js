import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import ResumePage from './components/ResumePage';
import ProjectsPage from './components/ProjectsPage';
import ThoughtsPage from './components/ThoughtsPage';
import QuotesPage from './components/QuotesPage';
import NowPage from './components/NowPage';
import ThoughtArticlePage from './components/ThoughtArticlePage';
import ScrollToTop from './components/ScrollToTop';
import { content } from './data/content';
import { getNowData } from './data/nowData';
import './styles/global.css';
import './styles/components.css';
import './styles/bookshelf.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainPage content={content} />} />
        <Route path="/resume" element={<ResumePage data={content.resume} />} />
        <Route path="/projects" element={<ProjectsPage data={content.projects} />} />
        <Route path="/thoughts" element={<ThoughtsPage data={content.thoughts} />} />
        <Route path="/thoughts/:slug" element={<ThoughtArticlePage />} />
        <Route path="/quotes" element={<QuotesPage data={content.quotes} />} />
        <Route path="/now" element={<NowPage data={getNowData} />} />
      </Routes>
    </Router>
  );
}

export default App;
