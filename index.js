const lyricsAPI = "https://api.lyrics.ovh/v1";
const youtubeAPI = "https://www.googleapis.com/youtube/v3/search";

function handleSearchForm() {
  $('.search-form').submit(event => {
    event.preventDefault();
    const artistQuery = $('.artist-string').val();
    const songQuery = $('.song-string').val();
    const combinedQuery = `${artistQuery} ${songQuery}`;
    clearInputFields();
    clearResultsContainers();
    unhideContainers();
    getYoutubeData(combinedQuery, displayYoutubeResults);
    getLyricsData(artistQuery, songQuery, displayLyricsResults);
  });
}

function unhideContainers() {
  $('.container').prop('hidden', false);
}

function clearInputFields() {
  $('artist.string').val("");
  $('song.string').val("");
}

function clearResultsContainers() {
  $('.container').empty();
}

function getLyricsData(artistQuery, songQuery, callback) {
  $.getJSON(`${lyricsAPI}/${artistQuery}/${songQuery}`, callback);
}

function displayLyricsResults(data) {
  const lyricsData = data.lyrics.replace(/\n/gi,"<br>");
  $('.lyrics').html(lyricsData);
}

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

handleSearchForm();