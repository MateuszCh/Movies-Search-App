/**
 * Created by Mateusz Chybiorz on 2017-01-13.
 */
(function ($) {
    //jQuery selectors
    var $searchResultDiv = $("#searchResult");
    var $resultsFor = $("#resultsFor");
    var $loadingResults = $("#loadingResults");
    //empty variables
    var searchResult = [];
    var text;
    var page;
    var resultsFound;
    var noMovieOrSeries;
    var numberOfPages;
    //function creating list of search results
    function makeListOfResults() {
        for(var i = 0; i < searchResult.length; i++){
            //only results with type "movie" or "series" are shown
            if(searchResult[i].Type == "movie" || searchResult[i].Type == "series") {
                var li = $("<li data-number='" + i + "'></li>");
                if(searchResult[i].Poster == "N/A"){
                    $(li).append("<div><div class='noPhotoSmall'>NO POSTER</div></div>")
                } else {
                    $(li).append("<figure><img class='smallPhoto' src='" + searchResult[i].Poster + "'></figure>")
                }
                $(li).append("<span class='resultsListTitleAndYear'><span>" + searchResult[i].Title + "</span><span>" + searchResult[i].Year + "</span></span>");
                $("#resultsList").append(li);
                noMovieOrSeries++;
            }
        }
    }
    //add stars depending on type of result
    function addStars(rating, type) {
        var src;
        var srcHalf;
        var srcEmpty;
        var stars = 10;
        if(type == "movie"){
            src = "images/green-star.png";
            srcHalf = "images/green-star-half.png";
            srcEmpty = "images/green-star-empty.png";

        } else {
            src = "images/pink-star.png";
            srcHalf = "images/pink-star-half.png";
            srcEmpty = "images/pink-star-empty.png";
        }
        while(1 <= rating){
            $("#stars").append("<img src='" + src + "'>");
            stars--;
            rating--;
        }
        if(rating >= 0.5){
            $("#stars").append("<img src='" + srcHalf + "'>");
            stars--;
        }
        while(stars > 0){
            $("#stars").append("<img src='" + srcEmpty + "'>");
            stars--;
        }
    }
    //changes format of duration from mm to hh:mm
    function formatDuration(duration) {
        if(duration == "N/A"){
            $("#duration").text(duration);
        } else {
            duration = duration.substring(0, duration.indexOf(" "));
            var hours = Math.floor(duration / 60);
            var minutes = duration % 60;
            if(hours > 0){
                if(minutes == 0){
                    $("#duration").text(hours + "h");
                } else {
                    $("#duration").text(hours + "h " + minutes + "min");
                }
            } else {
                $("#duration").text(minutes + "min");
            }
        }
    }
    //change colors of logo and search button depending on type of result
    function changeLayout(type) {
        var $logo = $(".kadr img");
        var $searchButton = $("#searchButton");
        if(type == "series"){
            $($searchButton).css("background-color", "#D4145A");
            $($logo).attr("src", "images/logo2.svg");
        } else {
            $($searchButton).css("background-color", "#00A99D");
            $($logo).attr("src", "images/logo1.svg");
        }
    }
    //calculate how many result pages we have
    function howManyPages(results) {
        var pages;
        if(results % 10 == 0){
            pages = results / 10;
        } else {
            pages = Math.floor(results / 10) + 1;
        }
        return pages;
    }
    //update page counter below list of results
    function updatePageNumber(page) {
        $("#numberOfPage").removeClass("hideButton").text(page);
    }
    function updatePrevNextButtons(numberOfPages) {
        $("#previous, #next").removeClass("hideButton").prop("disabled", false);
        if(page == 1){
            $("#previous").addClass("hideButton").prop("disabled", true);
        }
        if(page == numberOfPages){
            $("#next").addClass("hideButton").prop("disabled", true);
        }
    }
    //if no results is found, show info and hide previous and next buttons
    function ifNoResults() {
        $searchResultDiv.append("<p class='notFound'>No movie or series found!</p>");
        $("#previous, #next").addClass("hideButton").prop("disabled", true);
        $("#numberOfPage").addClass("hideButton");
    }
    function goUp(duration) {
        $("html, body").stop().animate({
            scrollTop: 0
        }, duration);
    }
    //event listeners
    $("#closeSearchResult").on("click", function () {
        $(".wrapper").show();
        goUp(1);
        $searchResultDiv.fadeOut(500, function () {
            $(".notFound").remove();
            $("#resultsList").empty();
        });
    });
    $("#searchButton").on("click", function (e) {
        e.preventDefault();
        var $searchText = $("#searchText");
        text = $.trim($searchText.val()).toLowerCase();
        if(text){
            $($loadingResults).show();
            $.getJSON("http://www.omdbapi.com/?s=" + encodeURI(text)).then(function (response) {
                $($loadingResults).hide().addClass("dark");
                if(response.Response == "True"){
                    page = 1;
                    noMovieOrSeries = 0;
                    searchResult = response.Search;
                    resultsFound = parseInt(response.totalResults);
                    numberOfPages = howManyPages(resultsFound);
                    makeListOfResults();
                    updatePageNumber(page);
                    updatePrevNextButtons(numberOfPages);
                    if(!noMovieOrSeries && numberOfPages == 1)    {
                        ifNoResults();
                    }
                } else if (response.Response == "False"){
                    ifNoResults();
                }
                $resultsFor.text("Results for '" + text + "':");
                $searchResultDiv.fadeIn(500, function () {
                    $(".wrapper").hide();
                });
            })
        }
        $searchText.val("");
    });
    $(".prevAndNext button").on("click", function () {
        $($loadingResults).show();
        if($(this).hasClass("previous")){
            page--;
        } else {
            page++;
        }
        $.getJSON("http://www.omdbapi.com/?s=" + encodeURI(text) + "&page=" + page).then(function (response) {
            goUp(500);
            $("#resultsList").empty();
            $($loadingResults).hide();
            noMovieOrSeries = 0;
            searchResult = response.Search;
            makeListOfResults();
            if(!noMovieOrSeries)    {
                $searchResultDiv.append("<p class='notFound'>No movie or series found!</p>");
            }
            updatePageNumber(page);
            updatePrevNextButtons(numberOfPages);
        });
    });
    $("#resultsList").on("click", "li", function () {
        $($loadingResults).show();
        $("#mainHeader").remove();
        $(".wrapper").removeClass("gradientBackground").addClass("backgroundPhoto");
        $(".kadr, .app, .searchBox").addClass("show");
        $("form").removeClass("show");
        $("#filmsPoster").remove();
        $("#noPhoto").remove();
        $("#stars").empty();
        var id = $(this).closest("li").data("number");
        id = searchResult[id].imdbID;
        $.getJSON("http://www.omdbapi.com/?i=" + encodeURI(id)).then(function (response) {
            changeLayout(response.Type);
            $($loadingResults).hide();
            $("#title").html(response.Title + "<span class='year'> (" + response.Year +")</span>");
            formatDuration(response.Runtime);
            $(".details p:nth-child(1)").show();
            $("#director").text(response.Director);
            $("#genre").text(response.Genre);
            $("#premiere").text(response.Released);
            $("#plot").text(response.Plot);
            if(response.imdbRating != "N/A"){
                $("#votes").text(response.imdbVotes + " votes");
                addStars(response.imdbRating, response.Type);
            } else {
                $("#votes").empty();
                $("#stars").empty();
            }
            if(response.Poster == "N/A") {
                $(".poster").append("<span id='noPhoto'>No Photo Available</span>");
            } else {
                $(".poster").append("<img src='" + response.Poster +"' id='filmsPoster'>");
            }
            $("#closeSearchResult").click();
        });
    });
})(jQuery);