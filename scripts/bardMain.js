/*
This jsaSound Code is distributed under LGPL 3
Copyright (C) 2012 National University of Singapore
Inquiries: director@anclab.org

This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.
This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNULesser General Public License for more details.
You should have received a copy of the GNU General Public License and GNU Lesser General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>
*/
require.config({
	paths: {
		"jsaSound": "http://animatedsoundworks.com:8001/",
		"jquery": "http://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min"
	}
});

define(
	["sceneControlHandler"],
	function (m_handler) {
		return 4;
	}
);