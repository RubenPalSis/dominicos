wget --mirror \
  --page-requisites \
  --adjust-extension \
  --convert-links \
  --no-parent \
  --level=2 \
  --timeout=10 \
  --tries=1 \
  --reject="xmlrpc.php" \
  https://baloncestodominicos.es/
