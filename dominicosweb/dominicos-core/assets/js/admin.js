/* Dominicos Core — selector de archivos de la pantalla "Datos del club". */
(function ($) {
  'use strict';

  var table = $('#dominicos-docs');
  if (!table.length) return;

  var addBtn = $('#dominicos-doc-add');
  var option = addBtn.data('option');
  var max    = parseInt(addBtn.data('max'), 10) || 8;

  /* Renumera los name[] tras añadir o quitar filas. */
  function reindex() {
    table.find('tbody tr').each(function (i) {
      $(this).find('input').each(function () {
        var name = $(this).attr('name') || '';
        $(this).attr('name', name.replace(/\[docs\]\[\d+\]/, '[docs][' + i + ']'));
      });
    });
  }

  addBtn.on('click', function () {
    var rows = table.find('tbody tr');
    if (rows.length >= max) {
      window.alert('Máximo ' + max + ' documentos.');
      return;
    }

    var i = rows.length;
    var row =
      '<tr class="dominicos-doc-row">' +
      '<td><input type="text" class="widefat" name="' + option + '[docs][' + i + '][title]" value=""></td>' +
      '<td><input type="url" class="widefat dominicos-doc-url" name="' + option + '[docs][' + i + '][url]" value="">' +
      '<button type="button" class="button dominicos-doc-pick" style="margin-top:4px">Elegir archivo</button></td>' +
      '<td><input type="text" class="widefat" name="' + option + '[docs][' + i + '][type]" value="PDF"></td>' +
      '<td><button type="button" class="button-link delete dominicos-doc-remove">Quitar</button></td>' +
      '</tr>';

    table.find('tbody').append(row);
  });

  table.on('click', '.dominicos-doc-remove', function () {
    $(this).closest('tr').remove();
    reindex();
  });

  table.on('click', '.dominicos-doc-pick', function () {
    var input = $(this).closest('td').find('.dominicos-doc-url');

    var frame = wp.media({
      title: 'Elegir documento',
      button: { text: 'Usar este archivo' },
      multiple: false
    });

    frame.on('select', function () {
      var file = frame.state().get('selection').first().toJSON();
      input.val(file.url);

      var title = $(this).closest('tr').find('input[type=text]').first();
      if (title.length && !title.val()) title.val(file.title || '');
    }.bind(this));

    frame.open();
  });
})(jQuery);
