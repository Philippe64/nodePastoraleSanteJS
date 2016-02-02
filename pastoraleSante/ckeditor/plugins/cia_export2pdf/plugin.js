CKEDITOR.plugins.add( 'cia_export2pdf',
{
	init: function( editor )
	{
		editor.addCommand( 'cia_export2pdf',
			{
				exec : function( editor )
				{

					export2pdf();
					
					
				}
			});
		editor.ui.addButton( 'export2pdf',
		{
			label: 'Pdf',
			command: 'cia_export2pdf',
			icon: this.path + 'images/export2pdf.png'
		} );
	}
} );