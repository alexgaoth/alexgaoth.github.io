import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PersonalWebsiteSection from './PersonalWebsiteSection';
import ThoughtArticlePage from './components/ThoughtArticlePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/thoughts/:slug" element={<ThoughtArticlePage />} />
        <Route path="/*" element={<PersonalWebsiteSection />} />
      </Routes>
    </Router>
  );
}

export default App;
