package main

import(
	"fmt"
	"net/http"
	"strconv"
	"encoding/json"
	"strings"
	"math/rand"
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
	sp := passvars.VALS["sp"]
	k  := alphNumStringNS( passvars.VALS["k"] )
	un := strings.ToLower(alphNumStringNS( passvars.VALS["uu"] ))
	if( (u.Status >= 1000 || passvars.VALS["uu"] == u.Username) && iExist( "private/characters/" + un + "/" + k + ".chr" ) ){
   		t := Character{}
		userfile := fileToString( "private/characters/" + un + "/" + k + ".chr" )
		json.Unmarshal([]byte(userfile) , &t)
		json.Unmarshal([]byte( f ), &t)
		t.Cspells = sp
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
			if( (un == u.Username && t.Cisnpc == "1") || t.Cisnpc != "1" ){
				if( s != "[" ){ s += "," }
				s += "[\"" + e.Name()[0:len(e.Name())-4] + "\", \"" + t.Cid + "\", \"" + t.Cname + "\", \"" + t.Cisnpc + "\" ]"
			}
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
func die_roll(w http.ResponseWriter, r *http.Request, u *Users, passvars *Hreqs){
	filename 	:= "private/rolls.log"
	n1, _ := strconv.Atoi( passvars.VALS["n1"] ) // Number of dice
	n2, _ := strconv.Atoi( passvars.VALS["n2"] ) // Number of sides per die


	r1      := 0
	rolls 	:= "["
	for i := 0; i < n1; i++ {
		droll := rand.Intn( n2 ) + 1 // prints integer between 0 and x, inclusively
		rolls += strconv.Itoa(droll) + ","
		r1 += droll 
	}
	rolls = rolls[:len(rolls)-1] + "]"

	f           := ""
	if( u.Status >= 10 ){
		f 			 = fileToString( filename )
		f 			 = "[" + `\"` + u.Username + `\"` + "," + strconv.Itoa(n1) + "," + strconv.Itoa(n2) + "," + rolls + "," + strconv.Itoa(r1) + "],\n" + f
		fa 			:= strings.Split(f, "\n")
		fd          := ""
		icount 		:= 0
		for _, ch := range fa {
			icount++
			if(icount <= 50 && ch != ""){
				fd += ch + "\n"
			}
		}
		iWriteFileByte( filename, []byte( fd )  )
		if(f != ""){
			f = strings.Replace(f, "\n", "", -1)
			f 			= f[:len(f)-1] 
		}
	}
	fmt.Fprintf(w, "%s", "{\"err\":\"\", \"cx\":\""+ u.Crosssite +"\", \"o\":\"[" + f + "]\", \"success\":\"true\"}")
}
func pull_die_roll(w http.ResponseWriter, r *http.Request, u *Users, passvars *Hreqs){
	filename 	:= "private/rolls.log"
	f := ""
	if( u.Status >= 10 ){
		f 			 = fileToString( filename )
		if(f != ""){
			f = strings.Replace(f, "\n", "", -1)
			f 			= f[:len(f)-1] 
		}
	}
	fmt.Fprintf(w, "%s", "{\"err\":\"\", \"cx\":\""+ u.Crosssite +"\", \"o\":\"[" + f + "]\", \"success\":\"true\"}")
}


