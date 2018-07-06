const lyricsAPI = "https://api.lyrics.ovh/v1";
const lyricsSuggestAPI = "https://api.lyrics.ovh/suggest";
const youtubeAPI = "https://www.googleapis.com/youtube/v3/search";
const wikipediaAPI = "https://en.wikipedia.org/w/api.php";
const songkickSearchAPI = "https://api.songkick.com/api/3.0/search/artists.json";

let searchCounter = 0;
let similarArtistsSearchCounter = 0;

/* SEARCH FORM FUNCTIONALITY */
function handleSearchForm() {
  $('.search-form').submit(event => {
    event.preventDefault();
    const artistQuery = $('.artist-string').val();
    const songQuery = $('.song-string').val();
    const combinedQuery = `${artistQuery} ${songQuery}`;
    clearInputFields();
    clearAndHideResultsContainers();
    preventSearchHistoryOverflow();
    addSearchHistoryEntry(artistQuery, songQuery);
    getLyricsIfSongQueryGiven(songQuery, combinedQuery);
    getYoutubeData(combinedQuery, displayYoutubeResults);
    getWikipediaSearchData(artistQuery, useWikipediaSearchDataToFindWikiPage);
    unhideContainers();
  });
}

/* CONTAINER AND INPUT FIELD BEHAVIORS PER SUBMISSION */
function unhideContainers() {
  $('.hidden').prop('hidden', false);
}

function clearInputFields() {
  $('.artist-string').val("");
  $('.song-string').val("");
}

function clearAndHideResultsContainers() {
  $('.container').empty();
  $('.container').prop('hidden', true);
}

/* SEARCH HISTORY FUNCTIONALITY */
function preventSearchHistoryOverflow() {
  searchCounter++;
  if (searchCounter > 5) {
    $('.search-history').find('.search-history-entry:first').remove();
  }
}

function addSearchHistoryEntry(artistQuery, songQuery) {
  if (songQuery == "") {
    $('.search-history').append(`
      <div class="search-history-entry">
        <span class="search-history-artist"><b>${artistQuery}</b></span><br>
        <img src="./images/search-logo.png" class="similar-search-logo">
      </div>
      `);
  }
  else {
    $('.search-history').append(`
      <div class="search-history-entry">
        <b>
          <span class="search-history-artist">${artistQuery}</span>
          <span"> - </span>
          <span class="search-history-song">${songQuery}</span><br>
          <img src="./images/search-logo.png" class="similar-search-logo">
        </b>
      </div>
      `);
  }
}

function handleSearchUsingSearchHistory() {
  $('.search-history').on('click', '.similar-search-logo', event => {
      const artistQuery = $(event.currentTarget).closest('div').find('.search-history-artist').text();
      const songQuery = $(event.currentTarget).closest('div').find('.search-history-song').text();
      const combinedQuery = `${artistQuery} ${songQuery}`;
      clearInputFields();
      clearAndHideResultsContainers();
      getLyricsIfSongQueryGiven(songQuery, combinedQuery);
      getYoutubeData(combinedQuery, displayYoutubeResults);
      getWikipediaSearchData(artistQuery, useWikipediaSearchDataToFindWikiPage);
      unhideContainers();
  });
}

/* YOUTUBE API FUNCTIONALITY */
function getYoutubeData(searchQuery, callback) {
  const query = {
    part: 'snippet',
    q: `artist ${searchQuery}`,
    type: 'video',
    maxResults: 10,
    key: 'AIzaSyAUuE2ybmwEb08dCMkOv6HvW1gJDi8mhbY',
    videoCategoryId: '10'
  };
  $.getJSON(youtubeAPI, query, callback);
}

function displayYoutubeResults(data) {
  $('.youtube').append(`
    <span role="heading" class="section-header">Video</span>
      <a href="https://www.youtube.com" target="_blank">
      <img src="./images/youtube-logo.png" class="youtube-logo">
      </a>
      <br>
      <br>
    `);
  const resultsData = data.items.map((item) => renderYoutubeResults(item));
  $('.youtube').append(resultsData);
}

function renderYoutubeResults(result) {
  return `
      <div class="youtube-single-result">
        <a href="https://www.youtube.com/watch?v=${result.id.videoId}" target="_blank">
          <img class="youtube-thumbnail" src="${result.snippet.thumbnails.high.url}">
          <h3 class="youtube-description">${result.snippet.title}</h3>
        </a>
        <p>${result.snippet.description}</p>
      </div>
  `;
}

/* LYRICS API FUNCTIONALITY */
function getLyricsIfSongQueryGiven(songQuery, combinedQuery) {
  if (songQuery !== "") {
      getSongData(combinedQuery, setDataForLyricsFetch);
      $('.lyrics').prop('hidden', false);
  }
}

function getSongData(combinedQuery, callback) {
  $.getJSON(`${lyricsSuggestAPI}/${combinedQuery}/`, callback);
}

function songLyricsFetchFailure() {
  $('.lyrics').empty().append(`
    <span role="heading" class="section-header">Song Lyrics</span>
      <a href="http://www.lyrics.ovh" target="_blank">
      <img src="./images/lyricsovh-logo.png" class="lyricsovh-logo">
      </a>
      <br>
      <br>
    <div class="song-lyrics">
      <span>No lyrics found. Please check artist/song spelling and/or punctuation where applicable.</span>
    </div>
    `);
}

function setDataForLyricsFetch(suggestJSON) {
  if (suggestJSON.total === 0) {
    songLyricsFetchFailure();
  }
  else {
    const songArtist = suggestJSON.data[0].artist.name;
    const songTitle = suggestJSON.data[0].title;
    displaySongInformation(songArtist, songTitle);
    getLyricsData(songArtist, songTitle, displayLyricsResults, songLyricsFetchFailure);
  }
}

function displaySongInformation(songArtist, songTitle) {
  $('.lyrics').append(`
    <span role="heading" class="section-header">Song Lyrics</span>
      <a href="http://www.lyrics.ovh" target="_blank">
      <img src="./images/lyricsovh-logo.png" class="lyricsovh-logo">
      </a>
      <br>
      <br>
    <div class="song-lyrics">
      <span>${songArtist} - ${songTitle}</span><br><br>
    </div>
    `);
}

function getLyricsData(songArtist, songTitle, callback, errorCallback) {
  $.getJSON(`${lyricsAPI}/${songArtist}/${songTitle}`, callback);
  $.ajax({
    url: `${lyricsAPI}/${songArtist}/${songTitle}`,
    dataType: 'json',
    success: callback,
    error: errorCallback
  });
}

function displayLyricsResults(data) {
  const lyricsData = data.lyrics.replace(/\n/gi,"<br>");
  $('.song-lyrics').append(lyricsData);
}

/* WIKIPEDIA API FUNCIONALITY */
function getWikipediaSearchData(artistQuery, callback) {
  query = {
    origin: '*',
    action: 'query',
    list: 'search',
    format: 'json',
    srsearch: `${artistQuery} music artist`
  };
  $.getJSON(wikipediaAPI, query, callback);
}

function useWikipediaSearchDataToFindWikiPage(wikiJSON) {
  const songArtist = wikiJSON.query.search[0].title;
  const pageID = wikiJSON.query.search[0].pageid;
  getWikipediaPageData(songArtist, displayWikipediaResults);
}

function getWikipediaPageData(songArtist, callback) {
  const query = {
    origin: '*',
    action: 'query',
    format: 'json',
    prop: 'extracts|pageimages',
    indexpageids: 1,
    redirects: 1,
    exchars: 1200,
    exsectionformat: 'plain',
    piprop: 'name|thumbnail|original',
    pithumbsize: 250,
    titles: songArtist
  };
  $.getJSON(wikipediaAPI, query, callback);
}

function displayWikipediaResults(data) {
  const pageID = data.query.pageids[0];
  const wikiTitle = data.query.pages[pageID].title;
  const wikiInfo = data.query.pages[pageID].extract;
  $('.wiki').append(`
    <span role="heading" class="section-header">Wikipedia</span>
    <a href="https://www.wikipedia.org/" target="_blank">
    <img src="./images/wiki-logo.png" class="wiki-logo">
    </a>
    <br>
    <br>
    <div class="wiki-result">
    </div>
  `);
  $('.wiki-result').append(`${wikiTitle}<br>`);
  $('.wiki-result').append(wikiInfo);
  getPageURL(pageID, displayLinkToWikipediaPage);
}

function getPageURL(pageID, callback) {
  const query = {
    origin: "*",
    action: 'query',
    format: 'json',
    prop: 'info',
    pageids: pageID,
    inprop: 'url',
    indexpageids: 1
  };
  $.getJSON(wikipediaAPI, query, callback);
}

function displayLinkToWikipediaPage(data) {
  const pageID = data.query.pageids[0];
  const wikiResultURL = data.query.pages[pageID].fullurl;
  $('.wiki').append(`
    <a href="${wikiResultURL}" target="_blank">
      <div class="wiki-footer">
        <span class="wiki-footer-text">Read More On Wikipedia</span>
      </div>
    </a>
  `);
}

/* DISCOVERED (THROUGH SIMILAR ARTISTS) HISTORY FUNCTIONALITY */
function preventDiscoveredHistoryOverflow() {
  similarArtistsSearchCounter++;
  if (similarArtistsSearchCounter > 5) {
    $('.similar-artists-history').find('.similar-artists-history-entry:first').remove();
  }
}

function addDiscoveredHistoryEntry(artistQuery) {
  $('.similar-artists-history').append(`
    <div class="similar-artists-history-entry">
      <span class="similar-artists-history-artist"><b>${artistQuery}</b></span><br>
      <img src="./images/search-logo.png" class="similar-search-logo">
    </div>
    `);
}

function unhideDiscoveredHistoryContainer() {
  $('.similar-artists-history-container').prop('hidden', false);
}

function handleSearchUsingDiscoveredHistory() {
  $('.similar-artists-history').on('click', '.similar-search-logo', event => {
      const artistQuery = $(event.currentTarget).closest('div').find('.similar-artists-history-artist').text();
      clearInputFields();
      clearAndHideResultsContainers();
      getYoutubeData(artistQuery, displayYoutubeResults);
      getWikipediaSearchData(artistQuery, useWikipediaSearchDataToFindWikiPage);
      getSongkickArtistID(artistQuery, getSongkickArtistDetails);
      unhideContainers();
  });
}

/* NAVBAR FUNCTIONS */
function showMobileNav() {
  $('.main-container').on('click', '.mobile-navbar', () => {
    $('.mobile-navbar-list').toggle([750]);
  });
}

function scrollToSearch() {
  $('.main-container').on('click', '#search-link', () => {
    $('html, body').animate({
      scrollTop: $('#search').offset().top -10
    }, 750);
  });
}

function scrollToRecentSearches() {
  $('.main-container').on('click', '#recents-link', () => {
    $('html, body').animate({
      scrollTop: $('#recents').offset().top -10
    }, 750);
  });
}

function scrollToSongLyrics() {
  $('.main-container').on('click', '#lyrics-link', () => {
    $('html, body').animate({
      scrollTop: $('#lyrics').offset().top -10
    }, 750);
  });
}

function scrollToWikipedia() {
  $('.main-container').on('click', '#wiki-link', () => {
    $('html, body').animate({
      scrollTop: $('#wiki').offset().top -10
    }, 750);
  });
}

function scrollToVideos() {
  $('.main-container').on('click', '#video-link', () => {
    $('html, body').animate({
      scrollTop: $('#video').offset().top -10
    }, 750);
  });
}

function handleNavbarFunctions() {
  showMobileNav();
  scrollToSearch();
  scrollToRecentSearches();
  scrollToSongLyrics();
  scrollToWikipedia();
  scrollToVideos();
}

/* EXECUTE ALL FUNCTION CALLS */
handleSearchForm();
handleSearchUsingSearchHistory();
handleSearchUsingDiscoveredHistory();
handleNavbarFunctions();