import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Projects from "./Projects";

import Tasks from "./Tasks";

import Clients from "./Clients";

import Documents from "./Documents";

import Invoices from "./Invoices";

import Expenses from "./Expenses";

import Calendar from "./Calendar";

import ProjectDetails from "./ProjectDetails";

import ClientDetails from "./ClientDetails";

import Estimates from "./Estimates";

import estimate-response from "./estimate-response";

import InvoicePayment from "./InvoicePayment";

import Settings from "./Settings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Projects: Projects,
    
    Tasks: Tasks,
    
    Clients: Clients,
    
    Documents: Documents,
    
    Invoices: Invoices,
    
    Expenses: Expenses,
    
    Calendar: Calendar,
    
    ProjectDetails: ProjectDetails,
    
    ClientDetails: ClientDetails,
    
    Estimates: Estimates,
    
    estimate-response: estimate-response,
    
    InvoicePayment: InvoicePayment,
    
    Settings: Settings,
    
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
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/Tasks" element={<Tasks />} />
                
                <Route path="/Clients" element={<Clients />} />
                
                <Route path="/Documents" element={<Documents />} />
                
                <Route path="/Invoices" element={<Invoices />} />
                
                <Route path="/Expenses" element={<Expenses />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/ProjectDetails" element={<ProjectDetails />} />
                
                <Route path="/ClientDetails" element={<ClientDetails />} />
                
                <Route path="/Estimates" element={<Estimates />} />
                
                <Route path="/estimate-response" element={<estimate-response />} />
                
                <Route path="/InvoicePayment" element={<InvoicePayment />} />
                
                <Route path="/Settings" element={<Settings />} />
                
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