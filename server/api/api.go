package api

import (
	"net/http"
	"strings"

	"github.com/go-midway/midway"
)

// ServeAPI generates a middleware to serve API for file / directory information
// query
func ServeAPI(path string, root http.FileSystem) midway.Middleware {

	path = strings.TrimRight(path, "/") // strip trailing slash
	pathWithSlash := path + "/"
	graphqlHandler := GraphQLHandler()
	graphiqlHandler := GraphiQLHandler(path + "/graphql")

	return func(inner http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			// serve API endpoint
			if r.URL.Path == path {
				http.Redirect(w, r, pathWithSlash, http.StatusMovedPermanently)
				return
			}
			if r.URL.Path == path+"/graphql" {
				graphCtx := withFilesystem(withEndpointContext(r.Context(), r), root)
				graphqlHandler.ServeHTTP(w, r.WithContext(graphCtx))
				return
			}
			if r.URL.Path == path+"/graphiql" {
				graphiqlHandler.ServeHTTP(w, r)
				return
			}

			// defers to inner handler
			inner.ServeHTTP(w, r)
		})
	}
}
