$(function(){
	// add switches to title bar
	$('#title')
			.append("<span class='status'><input id='uninstallpkg' type='checkbox'></span>")
			.append("<span class='status'><input id='deletepkg' type='checkbox'></span>");

	// tablesorter options
	$('#tblPackages').tablesorter({
		sortList: [[0,0]],
		widgets: ['saveSort', 'filter', 'stickyHeaders'],
		widgetOptions: {
			stickyHeaders_filteredToTop: true,
			filter_hideEmpty: true,
			filter_liveSearch: true,
			filter_saveFilters: true,
			filter_reset: '.reset',
			filter_functions: {
				'.filter-version': true,
				'.filter-downloaded': true,
				'.filter-installed': true
			}
		}
	});

	// "uninstall package" switch and cookie
	$('#uninstallpkg')
		.switchButton({
			labels_placement: 'left',
			on_label: 'unInstall On',
			off_label: 'unInstall Off',
			checked: $.cookie('nerdpack_packages_uninstall') == '--uninstall'
		})
		.change(function () {
			$.cookie('nerdpack_packages_uninstall', $('#uninstallpkg')[0].checked ? '--uninstall' : '', { expires: 3650 });
		});

	// "delete package" switch and cookie
	$('#deletepkg')
		.switchButton({
			labels_placement: 'left',
			on_label: 'delete On',
			off_label: 'delete Off',
			checked: $.cookie('nerdpack_packages_delete') == '--delete'
		})
		.change(function () {
			$.cookie('nerdpack_packages_delete', $('#deletepkg')[0].checked ? '--delete' : '', { expires: 3650 });
		});

	// select all packages switch
	$('#checkall')
		.switchButton({
			labels_placement: 'right',
			on_label: 'Select All',
			off_label: 'Select All',
			checked: $.cookie('nerdpack_checkall') == 'yes'
		})
		.change(function () {
			var myval = $(this)[0].checked;
			$.cookie('nerdpack_checkall', myval ? 'yes' : 'no', { expires: 3650 });
			$('#tblPackages tbody td:visible .pkgcheckbox').switchButton({checked: myval});
		});

	// set cookie on apply button press
	$('#btnApply').click(function() {
		checkDepends();

		$.post('/update.php', $('#package_form').serializeArray(), function() {
				openBox('/plugins/NerdPack/scripts/packagemanager&arg1=--download'+
							'&arg2='+$.cookie('nerdpack_packages_uninstall')+
							'&arg3='+$.cookie('nerdpack_packages_delete'),
							'Package Manager', 600, 900, true);
			}
		);
	});

	packageQuery();
});

//list all available packages in a table
function packageQuery(force) {
	$('#tblPackages tbody').html("<tr><td colspan='6'><br><i class='fa fa-spinner fa-spin icon'></i><em>Please wait, retrieving plugin information ...</em></td><tr>");
	$.getJSON('/plugins/NerdPack/include/PackageQuery.php', {force: force}, function(packages) {
		$('#tblPackages tbody').empty();
			var Ready;
  var len = packages.length, i = 0;
  for (i; i < len; i++) {
			var Update;
			if (packages[i].downloadeq == packages[i].downloaded && packages[i].installeq == packages[i].installed){
				Update = "<span><i class='uptodate fa fa-check'></i> up-to-date </span>";
			}else{
				Update = "<span ><a><i class='updateready fa fa-cloud-download'></i> update ready </a></span>";
				Ready = true;
				}

			var Downloaded = packages[i].downloaded;
			if (packages[i].downloadeq != packages[i].downloaded)
				Downloaded = 'old';

			var Installed = packages[i].installed;
			if (packages[i].installeq != packages[i].installed)
				Installed = 'old';

			$('#tblPackages tbody').append("<tr>"+
			"<td class='package' title='"+packages[i].desc+"'>"+packages[i].name+"</td>"+ // package name
			"<td>"+Update+"</td>"+ // package status
			"<td>"+packages[i].size+"</td>"+ // package size
			"<td>"+Downloaded+"</td>"+ // package downloaded
			"<td>"+Installed+"</td>"+ // package installed
			"<td>"+packages[i].plugins+"</td>"+ // package dependents
			"<td><input class='pkgcheckbox' id='"+packages[i].pkgname+"' type='checkbox' "+(packages[i].config=="yes"?"checked":"")+">"+
			"<input class='pkgvalue' type='hidden' id='"+packages[i].pkgname+"_value' name='"+packages[i].pkgnver+"' value='"+packages[i].config+"'></td>"+
			"</tr>");
		}
		if (Ready)
			$('#btnApply').prop('disabled', false);

		// attach switch buttons to every package checkbox all at once
		$('.pkgcheckbox')
			.switchButton({
				labels_placement: 'right',
				on_label: 'On',
				off_label: 'Off'
			})
			.change(function() {
				$(this).parent().parent().find('.pkgvalue').val(this.checked ? "yes": "no");
				if (this.checked)
					checkDepends();
				$('#btnApply').prop("disabled", false);
			});

		// restore filters
		var lastSearch = $('#tblPackages')[0].config.lastSearch;
		$('#tblPackages').trigger('update')
		.trigger('search', [lastSearch]);
	});
}

function checkDepends() {
	if ($('#screen')[0].checked) {
		$('#utempter').switchButton({checked: true});
		$('#utempter', '.pkgvalue').val('yes');
	}
	if ($('#iotop')[0].checked) {
		$('#python').switchButton({checked: true});
		$('#python', '.pkgvalue').val('yes');
	}
}
