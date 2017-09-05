const lyricsAPI = "https://api.lyrics.ovh/v1";
const lyricsSuggestAPI = "https://api.lyrics.ovh/suggest";
const youtubeAPI = "https://www.googleapis.com/youtube/v3/search";
const wikipediaAPI = "https://en.wikipedia.org/w/api.php";
const songkickSearchAPI = "https://api.songkick.com/api/3.0/search/artists.json";

/* SEARCH FORM FUNCTIONALITY */
function handleSearchForm() {
  $('.search-form').submit(event => {
    event.preventDefault();
    const artistQuery = $('.artist-string').val();
    const songQuery = $('.song-string').val();
    const combinedQuery = `${artistQuery} ${songQuery}`;
    clearInputFields();
    clearAndHideResultsContainers();
    if (songQuery !== "") {
      getSongData(combinedQuery, setDataForLyricsFetch);
    }
    getYoutubeData(combinedQuery, displayYoutubeResults);
    getWikipediaSearchData(artistQuery, useWikipediaSearchDataToFindWikiPage);
    getSongkickArtistID(artistQuery, getSongkickArtistDetails);
    unhideContainers();
  });
}

/* CONTAINER AND INPUT FIELD BEHAVIORS PER SUBMISSION */
function unhideContainers() {
  $('.container').prop('hidden', false);
}

function clearInputFields() {
  $('artist.string').val("");
  $('song.string').val("");
}

function clearAndHideResultsContainers() {
  $('.container').empty();
  $('.container').prop('hidden', true);
}

/* YOUTUBE API FUNCTIONALITY */
function getYoutubeData(searchQuery, callback) {
  const query = {
    part: 'snippet',
    q: `artist ${searchQuery}`,
    type: 'video',
    maxResults: 8,
    key: 'AIzaSyAUuE2ybmwEb08dCMkOv6HvW1gJDi8mhbY',
    videoCategoryId: '10'
  };
  $.getJSON(youtubeAPI, query, callback);
}

function displayYoutubeResults(data) {
  const resultsData = data.items.map((item) => renderYoutubeResults(item));
  $('.youtube').html(resultsData);
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
function getSongData(combinedQuery, callback) {
  $.getJSON(`${lyricsSuggestAPI}/${combinedQuery}/`, callback);
}

function setDataForLyricsFetch(suggestJSON) {
  const songArtist = suggestJSON.data[0].artist.name;
  const songTitle = suggestJSON.data[0].title;
  displaySongInformation(songArtist, songTitle);
  getLyricsData(songArtist, songTitle, displayLyricsResults);
}

function displaySongInformation(songArtist, songTitle) {
  $('.lyrics').append(`
    <span>Song Lyrics</span>
      <a href="http://www.lyrics.ovh" target="_blank">
      <img src="./images/lyrics-ovh-logo.png" class="lyricsovh-logo">
      </a>
      <br>
      <br>
    <div class="song-lyrics">
      <span>${songArtist} - ${songTitle}</span><br><br>
    </div>
    `);
}

function getLyricsData(songArtist, songTitle, callback) {
  $.getJSON(`${lyricsAPI}/${songArtist}/${songTitle}`, callback);
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
  $.getJSON(wikipediaAPI, query, callback)
}

function useWikipediaSearchDataToFindWikiPage(wikiJSON) {
  const songArtist = wikiJSON.query.search[0].title;
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
  $.getJSON(wikipediaAPI, query, callback)
}

function displayWikipediaResults(data) {
  const pageID = data.query.pageids[0];
  const wikiTitle = data.query.pages[pageID].title;
  const wikiInfo = data.query.pages[pageID].extract;
  $('.wiki').append(`${wikiTitle}<br>`);
  $('.wiki').append(wikiInfo);
}

/* SONGKICK API FUNCTIONALITY */
function getSongkickArtistID(artistQuery, callback) {
  const query = {
    query: artistQuery,
    apikey: 'mtLUgpC0c49wQgiQ'
  };
  $.getJSON(songkickSearchAPI, query, callback);
}

function getSongkickArtistDetails(songkickAPIData) {
  const artistID = songkickAPIData.resultsPage.results.artist[0].id;
  getSongkickArtistEventData(artistID, displaySongkickEventData);
  getSongkickSimilarArtistsData(artistID, displaySongkickSimilarArtistsData);
}

function getSongkickArtistEventData(artistID, callback) {
  const songkickEventAPI = `https://api.songkick.com/api/3.0/artists/${artistID}/calendar.json`;
  const query = {
    per_page: 5,
    apikey: 'mtLUgpC0c49wQgiQ'
  };
  $.getJSON(songkickEventAPI, query, callback);
}

function displaySongkickEventData(songkickAPIData) {
  if (songkickAPIData.resultsPage.totalEntries == 0) {
    $('.shows').append(`
      <span>Upcoming Events</span>
      <a href="http://www.songkick.com/" target="_blank">
      <img src="./images/powered-by-songkick-pink.png" class="songkick-logo">
      </a>
      <br>
      <br>
      <div class="shows-single-result">
        <span>None</span>
      </div>
      `);
  }
  else {
    const resultsData = songkickAPIData.resultsPage.results.event.map((item) => renderSongkickEventData(item));
    $('.shows').append(`
      <span>Upcoming Events</span>
      <a href="http://www.songkick.com/" target="_blank">
      <img src="./images/powered-by-songkick-pink.png" class="songkick-logo">
      </a>
      <br>
      <br>
      `);
    $('.shows').append(resultsData); 
  }
}

function renderSongkickEventData(item) {
  return `
      <div class="shows-single-result">
        <span>Date: ${item.start.date}</span><br>
        <span>Event:</span><br>
        <a href="${item.uri} target="_blank">
          <span>${item.displayName}</span><br>
        </a>
        <span>Venue:</span><br>
        <a href="${item.venue.uri} target="_blank">
          <span>${item.venue.displayName}</span><br>
        </a>
      </div>
  `;
}

function getSongkickSimilarArtistsData(artistID, callback) {
  const songkickSimilarArtistsAPI = `https://api.songkick.com/api/3.0/artists/${artistID}/similar_artists.json?`;
  const query = {
    per_page: 5,
    apikey: 'mtLUgpC0c49wQgiQ'
  };
  $.getJSON(songkickSimilarArtistsAPI, query, callback);
}

function displaySongkickSimilarArtistsData(songkickAPIData) {
  const resultsData = songkickAPIData.resultsPage.results.artist.map((item) => renderSongkickSimilarArtistsData(item));
  $('.similar-artists').append(`
    <span>Check Out Similar Artists</span>
    <a href="http://www.songkick.com/" target="_blank">
    <img src="./images/powered-by-songkick-pink.png" class="songkick-logo">
    </a>
    <br>
    <br>
    `);
  $('.similar-artists').append(resultsData);
}

function renderSongkickSimilarArtistsData(item) {
  return `
      <div class="similar-artists-single-result">
        <a href="${item.uri} target="_blank">
          <span>${item.displayName}</span>
        </a>
      </div>
  `;
}

/* EXECUTE ALL FUNCTION CALLS */
handleSearchForm();