{{/*
Expand the name of the chart.
*/}}
{{- define "gigmatch-monitoring.name" -}}
{{- default .Chart.Name .Values.global.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "gigmatch-monitoring.fullname" -}}
{{- if .Values.global.fullnameOverride }}
{{- .Values.global.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.global.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "gigmatch-monitoring.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "gigmatch-monitoring.labels" -}}
helm.sh/chart: {{ include "gigmatch-monitoring.chart" . }}
{{ include "gigmatch-monitoring.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "gigmatch-monitoring.selectorLabels" -}}
app.kubernetes.io/name: {{ include "gigmatch-monitoring.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "gigmatch-monitoring.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "gigmatch-monitoring.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the prometheus config
*/}}
{{- define "gigmatch-monitoring.prometheusConfigName" -}}
{{- printf "%s-prometheus-config" (include "gigmatch-monitoring.fullname" .) }}
{{- end }}

{{/*
Create the name of the prometheus service
*/}}
{{- define "gigmatch-monitoring.prometheusServiceName" -}}
{{- printf "%s-prometheus" (include "gigmatch-monitoring.fullname" .) }}
{{- end }}

{{/*
Create the name of the grafana service
*/}}
{{- define "gigmatch-monitoring.grafanaServiceName" -}}
{{- printf "%s-grafana" (include "gigmatch-monitoring.fullname" .) }}
{{- end }}

{{/*
Create the name of the node-exporter service
*/}}
{{- define "gigmatch-monitoring.nodeExporterServiceName" -}}
{{- printf "%s-node-exporter" (include "gigmatch-monitoring.fullname" .) }}
{{- end }}

{{/*
Create the name of the mongodb-exporter service
*/}}
{{- define "gigmatch-monitoring.mongodbExporterServiceName" -}}
{{- printf "%s-mongodb-exporter" (include "gigmatch-monitoring.fullname" .) }}
{{- end }} 