import Layout from "./Layout.jsx";

import APIDocumentation from "./APIDocumentation";

import Admin from "./Admin";

import Analytics from "./Analytics";

import Dashboard from "./Dashboard";

import Downloads from "./Downloads";

import FileManagement from "./FileManagement";

import Home from "./Home";

import IconDownload from "./IconDownload";

import KnowledgeBase from "./KnowledgeBase";

import Projects from "./Projects";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    APIDocumentation: APIDocumentation,
    
    Admin: Admin,
    
    Analytics: Analytics,
    
    Dashboard: Dashboard,
    
    Downloads: Downloads,
    
    FileManagement: FileManagement,
    
    Home: Home,
    
    IconDownload: IconDownload,
    
    KnowledgeBase: KnowledgeBase,
    
    Projects: Projects,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<APIDocumentation />} />
                
                
                <Route path="/APIDocumentation" element={<APIDocumentation />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Downloads" element={<Downloads />} />
                
                <Route path="/FileManagement" element={<FileManagement />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/IconDownload" element={<IconDownload />} />
                
                <Route path="/KnowledgeBase" element={<KnowledgeBase />} />
                
                <Route path="/Projects" element={<Projects />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}