var svg = document.getElementById('mySvg');
function hideAndShowFigure(figureId, delay) {
  var figure = document.getElementById(figureId);

  figure.style.display = 'none';

  setTimeout(function() {
    figure.style.display = 'block';
  }, delay);
}

hideAndShowFigure('figure1', 500);
hideAndShowFigure('figure5', 500);
hideAndShowFigure('figure2', 1000);
hideAndShowFigure('figure12', 1000);
hideAndShowFigure('figure3', 1500);
hideAndShowFigure('figure4', 1500);
hideAndShowFigure('figure8', 1500);
hideAndShowFigure('figure9', 1500);
hideAndShowFigure('figure10', 1500);
hideAndShowFigure('figure6', 2000);
hideAndShowFigure('figure7', 2000);
hideAndShowFigure('figure11', 2500);

