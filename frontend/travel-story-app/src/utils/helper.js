import ADD_STORY_IMG from "../assets/images/imgEmpty.svg"
import NO_SEARCH_DATA_IMG from "../assets/images/nosearch.svg" 
import NO_FILTER_DATA_IMG from "../assets/images/nofilter.svg" 

export const validateEmail = (email) => {
  const regex = /^(?![_.])[A-Za-z0-9._-]+(?<![_.])@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return regex.test(email);
}
export const getInitials = (name) => {
  if (!name) return '';
  const nameParts = name.split(' ');
  const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
  return initials;
}
export const getEmptyCardMessage = (filterType) => {
  switch (filterType) {
    case "search":
      return "Oops! No stories found matching your search.";
    case "date":
      return "No stories found in the given date range";
    default:
      return `Start creating your first Travel Story! Click the 'Add' button to jot down yoir throughts, ideas, and memories. Let's get started`;
  }
}

export const getEmptyCardImg = (filterType) =>{
  switch (filterType) {
    case "search":
      return NO_SEARCH_DATA_IMG;
    case "date":
      return NO_FILTER_DATA_IMG;
    default:
      return ADD_STORY_IMG;
  }
}