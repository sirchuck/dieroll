package main

import(
	"fmt"
	"net/http"
	"strconv"
	"encoding/json"
	"strings"
//	"io/ioutil"
	"os"
//	"bufio"
//    "encoding/base64"
//    "image"
//    "image/jpeg"
//    "image/png"
)

func char_load(w http.ResponseWriter, r *http.Request, u *Users, passvars *Hreqs){
//	sa 			:= ""
	tchar       := Character{}
	userfile 	:= ""
	k  := alphNumStringNS( passvars.VALS["k"] )
	un := strings.ToLower(alphNumStringNS( passvars.VALS["uu"] ))
	if( u.Status >= 1000 || passvars.VALS["uu"] == u.Username ){
		if( len( un ) > 1 && len( un ) < 16 ){
			if( k == "0" ){
				useid := 0
				iMakeDir( "private/characters/" + un )
				entries, _ := os.ReadDir("private/characters/" + un + "/" )
				for _, e := range entries {
					fni, _ := strconv.Atoi( e.Name()[0:len(e.Name())-4] )
					if( fni > useid ){
						useid = fni
					}
				}
				nk := strconv.Itoa(useid + 1)
				// Write the file
				tchar.Cid   = un + "_" + nk
				tchar.Cname = "Character Name"
				b, _ := json.Marshal(tchar)
				iWriteFileByte( "private/characters/" + un + "/" + nk + ".chr", b )
				k = nk
			}
			userfile    = fileToString( "private/characters/" + un + "/" + k + ".chr" )
		}
	}
	// Check if user has image for this champion.
	hasimg := iExist( "public/champs/" + un + "/" + un + "_" + k + ".jpg" )
	myimg := ""
	if(hasimg){
		myimg = fileToString( "public/champs/" + un + "/" + un + "_" + k + ".jpg" )
	}
	fmt.Fprintf(w, "%s", "{\"err\":\"\", \"cx\":\""+ u.Crosssite +"\", \"sa\":"+userfile+", \"hasimg\":" + iFormatBool(hasimg) + ", \"img\":\"" + myimg + "\", \"success\":\"true\"}")
}
func char_update(w http.ResponseWriter, r *http.Request, u *Users, passvars *Hreqs){
	// f  := alphNumStringNS( passvars.VALS["f"] )
	f  := passvars.VALS["f"]
	k  := alphNumStringNS( passvars.VALS["k"] )
	un := strings.ToLower(alphNumStringNS( passvars.VALS["uu"] ))
	if( (u.Status >= 1000 || passvars.VALS["uu"] == u.Username) && iExist( "private/characters/" + un + "/" + k + ".chr" ) ){
   		t := Character{}
		userfile := fileToString( "private/characters/" + un + "/" + k + ".chr" )
		json.Unmarshal([]byte(userfile) , &t)
		json.Unmarshal([]byte( f ), &t)
		b, _ := json.Marshal(t)
		iWriteFileByte( "private/characters/" + un + "/" + k + ".chr", b )
	}
	fmt.Fprintf(w, "%s", "{\"err\":\"\", \"cx\":\""+ u.Crosssite +"\", \"success\":\"true\"}")
}
func char_delete(w http.ResponseWriter, r *http.Request, u *Users, passvars *Hreqs){
	k  := alphNumStringNS( passvars.VALS["k"] )
	un := strings.ToLower(alphNumStringNS( passvars.VALS["uu"] ))
	if( u.Status >= 1000 || passvars.VALS["uu"] == u.Username ){
		iDeleteFile( "private/characters/" + un + "/" + k + ".chr" )
		iDeleteFile( "public/champs/" + un + "/" + un + "_" + k + ".jpg" )
	}
	fmt.Fprintf(w, "%s", "{\"err\":\"\", \"cx\":\""+ u.Crosssite +"\", \"success\":\"true\"}")
}
func char_list(w http.ResponseWriter, r *http.Request, u *Users, passvars *Hreqs){
	s  := "["
	un := strings.ToLower(alphNumStringNS( passvars.VALS["uu"] ))
	entries, _ := os.ReadDir("private/characters/" + un + "/" )
	for _, e := range entries {
		if iExist( "private/characters/" + un + "/" + e.Name() ){
	   		t := Character{}
			userfile := fileToString( "private/characters/" + un + "/" + e.Name() )
			json.Unmarshal([]byte(userfile) , &t)
			if( s != "[" ){ s += "," }
			s += "[\"" + e.Name()[0:len(e.Name())-4] + "\", \"" + t.Cid + "\", \"" + t.Cname + "\" ]"
		}
	}
	s += "]"
	fmt.Fprintf(w, "%s", "{\"err\":\"\", \"cx\":\""+ u.Crosssite +"\", \"s\":" + s + ", \"success\":\"true\"}")
}
func char_update_img(w http.ResponseWriter, r *http.Request, u *Users, passvars *Hreqs){
	// https://stackoverflow.com/questions/46022262/convert-base64-string-to-jpg
	k  := alphNumStringNS( passvars.VALS["k"] )
	un := strings.ToLower(alphNumStringNS( passvars.VALS["uu"] ))
	if( (u.Status >= 1000 || passvars.VALS["uu"] == u.Username) && passvars.VALS["img"] != "" ){
		iMakeDir( "public/champs/" + un )
		iWriteFileByte( "public/champs/" + un + "/" + un + "_" + k + ".jpg", []byte( passvars.VALS["img"] )  )
	}
	fmt.Fprintf(w, "%s", "{\"err\":\"\", \"cx\":\""+ u.Crosssite +"\", \"success\":\"true\"}")
}
