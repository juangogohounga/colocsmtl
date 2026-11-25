import Home from './pages/Home';
import ProfileSetup from './pages/ProfileSetup';
import BrowseRoommates from './pages/BrowseRoommates';
import BrowseListings from './pages/BrowseListings';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Neighborhoods from './pages/Neighborhoods';
import CreateListing from './pages/CreateListing';
import MyProfile from './pages/MyProfile';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ProfileSetup": ProfileSetup,
    "BrowseRoommates": BrowseRoommates,
    "BrowseListings": BrowseListings,
    "Matches": Matches,
    "Chat": Chat,
    "Neighborhoods": Neighborhoods,
    "CreateListing": CreateListing,
    "MyProfile": MyProfile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};