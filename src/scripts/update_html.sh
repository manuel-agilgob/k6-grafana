rm index.html
echo '<ul>' > index.html
for f in $(find . -name "*.html" -not -name "index.html"); do
  echo "<li><a href=\"$f\">$f</a></li>" >> index.html
done
echo '</ul>' >> index.html
