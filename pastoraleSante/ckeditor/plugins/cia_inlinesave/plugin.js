CKEDITOR.plugins.add( 'cia_inlinesave',
{
	init: function( editor )
	{
		editor.addCommand( 'cia_inlinesave',
			{
				exec : function( editor )
				{

					SaveData();
					
					
				}
			});
		editor.ui.addButton( 'Inlinesave',
		{
			label: 'Save',
			command: 'cia_inlinesave',
			icon: this.path + 'images/inlinesave.png'
		} );
	}
} );