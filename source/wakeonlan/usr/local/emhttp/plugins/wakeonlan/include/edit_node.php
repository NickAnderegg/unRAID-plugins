<?php
$filename = "/boot/config/plugins/wakeonlan/wakeonlan.xml";

if (is_file($filename)) {

	$Host = "//*/address[@addr='{$_POST["oldmac"]}']/parent::*";

	$xml = simplexml_load_file($filename);
	$xml->xpath("$Host/hostnames/hostname/@name")[0][0] = $_POST["name"];
	$xml->xpath("$Host/address[@addrtype='ipv4']/@addr")[0][0] = $_POST["ip"];
	$xml->xpath("$Host/address[@addrtype='mac']/@addr")[0][0] = $_POST["mac"];

	$xml->asXML($filename);
}
?>