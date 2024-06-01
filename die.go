package main

import (
	"fmt"
	"flag"
	"net/http"
//	"encoding/json"
//	"strings"
//	"github.com/NYTimes/gziphandler"
//	"runtime"
)


func buildHTML( incluceHF int, outCSS []string, outJS []string, outHTML []string, isLoggedIn string, u *Users ) string {
	o := ""
	if(incluceHF == 1){
		o += fileToString( conf.URLS["HTML"] + "/innerHeader.htm" )
	}
	for _, element := range outHTML {
		o += fileToString( element )
    }

    css_o := ""
    js_o  := ""

	for _, element := range outCSS {
		css_o += fileToString( element )
    }
	for _, element := range outJS {
		js_o += fileToString( element )
    }

	if(incluceHF == 1){
		o += fileToString( conf.URLS["HTML"] + "/innerFooter.htm" )
	}

	o = iReplace(o, "<STYLE></STYLE>"   , "<STYLE>"  + css_o + "</STYLE>"  ,1)
	o = iReplace(o, "<SCRIPT></SCRIPT>" , "<SCRIPT>" + js_o  + "</SCRIPT>" ,1)

	o = iReplace(o, "<MYCX>"         , u.Crosssite        ,-1)
	o = iReplace(o, "<ROOT_URL>"     , conf.URLS["ROOT"]  ,-1)
	o = iReplace(o, "<ISLOGGEDIN>"   , isLoggedIn         ,-1)
	o = iReplace(o, "<BACGROUNDIMG>" , randbg()           ,-1)

	return o
}

func uriHandler(w http.ResponseWriter, r *http.Request) {
	var uri MyURI
	err := uri.SetURI(r)
		cErr(err, "Set URI Information", true)

	if( uri.RFileExt == "ico" || uri.RFileExt == "png" ||  uri.RFileExt == "jpg" ||  uri.RFileExt == "pdf" || uri.RFileExt == "js" ||  
		uri.RFileExt == "css" ||  uri.RFileExt == "txt" ||  uri.RFileExt == "xml" ||  uri.RFileExt == "min.map" ||
		uri.RFileExt == "wav" || uri.RFileExt == "mp4" || uri.RFileExt == "mov" ||  uri.RFileExt == "mp3" || uri.RFileExt == "webp" ){
		if conf.BOOL_VALS["UseHTTPControlCashe"] { w.Header().Set("Cache-Control", "max-age=31536000") }
		http.ServeFile(w, r, conf.URLS["PUBLIC"] + "/" + uri.RFilePath )
	}else{
		// Check Login 
		u          := Users{}
		isLoggedIn := "0";
		Cookie     := GetCookie(r, "dieroll")

		passvars   := Hreqs{}
		pull_passvars( r, &passvars )
		check_login( w, &Cookie, &isLoggedIn, &u, &passvars, uri.Controller ) // Sets User (u) if found.

		if( uri.Controller == "er" ){
			fmt.Fprintf(w, "%s", "1")
		}else if( uri.Controller == "ajax" ){
			// r.ParseForm() and then read the values using r.Form["username"][0]

			// check cx u.cx == upload.cx

			if( uri.Method == "login" ){
				do_login(w,r,&passvars)
			}else if( uri.Method == "logout" ){
				do_logout(w,&u)
			}else if( uri.Method == "get_dashboard" ){
				pull_user_list(w,r,&u)
			}else if( uri.Method == "update_user" ){
				update_user(w,r,&u,&passvars)
			}else if( uri.Method == "char_delete" ){
				char_delete(w,r,&u,&passvars)
			}else if( uri.Method == "char_list" ){
				char_list(w,r,&u,&passvars)
			}else if( uri.Method == "char_load" ){
				char_load(w,r,&u,&passvars)
			}else if( uri.Method == "char_update" ){
				char_update(w,r,&u,&passvars)
			}else if( uri.Method == "char_update_img" ){
				char_update_img(w,r,&u,&passvars)
			} else {
				// Mabey do something?
			}
		

			// fmt.Fprintf(w, "%s", "useing ajax must be logged in.")
		}else{
			// Include Header / Footer, CSS, JS, HTM
			css  := []string{ conf.URLS["CSS"]  + "/general.css" }
			js   := []string{ conf.URLS["JS"]   + "/general.js" }
			html := []string{ conf.URLS["HTML"] + "/home.htm" }
			o := buildHTML(1, css, js, html, isLoggedIn, &u)
			// fmt.Fprintf(w, "%s", "The page you are looking for does not exist.")
			fmt.Fprintf(w, "%s", o)
		}
	}



/*

	}else if( uri.Controller == "captcha" ){
		uri_CAPTCHA(w, r, &uri)

	}else if( uri.Controller == "scripts" ){
		uri_SCRIPT(w, r, &uri)

	}else if( uri.Controller == "ajax" ){
		// $.ajaxSetup({ cache: false }); - Apparently we dont need to specify cache control because ajax post values.
		//w.Header().Set("Cache-Control","no-store, must-revalidate") 
		//w.Header().Set("Pragma","no-cache") 
		//w.Header().Set("Expires","-1")
		//w.Header().Set("Vary","Accept-Encoding") 
		uri_AJAX(w, r, &uri)

	}else{
		uri_NORMAL(w, r, &uri)
	}
*/
}


func main() {
	// command , default, options report
	confPtr := flag.String("c","local","-c local|??|config_file_name")
	flag.Parse()
	if *confPtr != "" { *confPtr = *confPtr + ".conf" } else { *confPtr = "conf" }
	conf.getConfig(*confPtr)
	//	runtime.GOMAXPROCS( conf.SERVER["GOMAXPROCS"] )

	// File Setup
	if( iExist("private/users/privileges.idx" ) ){
		iWriteFileByte( "private/users/privileges.idx", []byte("") )
	}

	Tools_init()
	buildbg()
	http.HandleFunc("/", uriHandler)

//	go func(){
//		err := http.ListenAndServeTLS(conf.URLS["listen_sport"], conf.SERVERSCRT["CERT_CRT"], conf.SERVERSCRT["CERT_KEY"], nil )
//			cErr(err, "HTTPS: Server Error: ", true)
//	}()
//	go http.ListenAndServeTLS(conf.URLS["listen_sport"], conf.SERVERSCRT["CERT_CRT"], conf.SERVERSCRT["CERT_KEY"], nil )

	if (conf.USEHTTPS == 1){
		fmt.Println( "Listening Secure on: "  + conf.HTTPSPORT )
		err := http.ListenAndServeTLS(":" + conf.HTTPSPORT, conf.SERVERSCRT["CERT_CRT"], conf.SERVERSCRT["CERT_KEY"], nil )
			cErr(err, "HTTPS: Server Error: ", false)
	} else {
		fmt.Println( "Listening on: "  + conf.HTTPPORT )
		err := http.ListenAndServe(":" + conf.HTTPPORT, nil )
			cErr(err, "HTTP: Server Error: ", false)
	}

}