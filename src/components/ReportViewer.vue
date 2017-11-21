<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <div class="field">
          <label for="revision" class="label">Revision</label>
          <div class="control">
            <div class="select">
              <select
                id="revision"
                name="revision"
                v-model="revision"
              >
                <option value="">Select a revision</option>
                <option
                  v-for="rev in revisions"
                  :value="rev"
                  :key="rev"
                >
                  {{ rev }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="field">
          <label for="report-type" class="label">Report Type</label>
          <div class="control">
            <div class="select">
              <select
                id="report-type"
                name="report-type"
                v-model="reportType"
              >
                <option value="">Select a report</option>
                <option
                  v-for="report in reportTypes"
                  :value="report"
                  :key="report"
                >
                  {{ shortName(report) }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="field">
      <div v-if="artifacts.deob" class="is-inline-block">
        <a
          :href="artifacts.deob.url"
          target="_blank"
          class="tags has-addons"
        >
          <span class="tag is-dark">Artifact</span>
          <span class="tag is-danger">runelite-deob.jar</span>
        </a>
      </div>
      <div v-if="artifacts.pack" class="is-inline-block">
        <a
          :href="artifacts.pack.url"
          target="_blank"
          class="tags has-addons"
        >
          <span class="tag is-dark">Artifact</span>
          <span class="tag is-warning">gamepack.jar</span>
        </a>
      </div>
    </div>
    <p v-if="reportType.startsWith('com.uniquepassive.osrsexploits')">
      <a
        class="button is-small"
        target="_blank"
        :href="`https://github.com/UniquePassive/osrs-exploits/blob/master/src/main/java/${reportType.replace(/\./g, '/')}.java`"
      >
        <span class="icon">
          <i class="fa fa-github"></i>
        </span>
        <span>{{ shortName(reportType) }}.java</span>
      </a>
      <a
        class="button is-small"
        target="_blank"
        href="https://github.com/UniquePassive/osrs-exploits"
      >
        <span class="icon">
          <i class="fa fa-github"></i>
        </span>
        <span>UniquePassive/osrs-exploits</span>
      </a>
    </p>
    <div class="box">
      <pre v-text="report"></pre>
    </div>
  </section>
</template>

<script>
import Axios from 'axios'
import { last } from 'lodash'

const reports = Axios.create({
  baseURL: 'https://storage.runetek.io/reports'
})

const gpack = Axios.create({
  baseURL: 'https://gpack.me/api'
})

const gpackV2 = Axios.create({
  baseURL: 'https://api.gpack.me'
})

export default {
  name: 'ReportViewer',
  props: {
    rt: String,
    rev: String
  },
  data () {
    return {
      keys: [],
      cache: {},
      loading: false,
      revision: (this.rev || this.$route.query.rev) || '',
      reportType: (this.rt || this.$route.query.rt) || '',
      report: '',
      reportTypes: [],
      revisions: [],
      artifacts: {
        pack: null,
        deob: null
      }
    }
  },
  computed: {
    shortReportTypes () {
      return this.reportTypes.map(x => this.shortName(x))
    },
    reportPath () {
      const [rev, type] = [this.revision, this.reportType]
      if (rev === '' || type === '') {
        return ''
      }

      return `${rev}/${type}.txt`
    }
  },
  methods: {
    fetchArtifacts () {
      gpack.get(`artifacts/${this.revision}`)
        .then(({ data }) => {
          this.artifacts = {
            ...this.artifacts,
            ...data
          }
        })
    },
    shortName (reportType) {
      return last(reportType.split('.'))
    },
    fetchReports () {
      gpackV2.get(`reports/${this.revision}`)
        .then(({ data }) => {
          this.reportTypes = data.data.map(x => x.fqcn)
        })
    },
    fetchReport () {
      const path = this.reportPath
      if (path) {
        reports.get(path)
          .then(({ data }) => {
            this.report = data
          })
      }
    }
  },
  mounted () {
    gpackV2.get('/search_index')
      .then(({ data }) => {
        this.revisions = data.revisions
      })
      .then(() => this.fetchReports())
      .then(() => this.fetchReport())
  },
  watch: {
    revision (rev) {
      this.fetchReport()
      this.fetchArtifacts()
      this.fetchReports()
      if (rev !== '') {
        this.$router.push({
          name: 'reports',
          query: {
            ...this.$route.query,
            rev
          }
        })
      } else {
        delete this.$route.query['rev']
      }
    },
    reportType (rt) {
      this.fetchReport()
      if (rt !== '') {
        this.$router.push({
          name: 'reports',
          query: {
            ...this.$route.query,
            rt
          }
        })
      } else {
        delete this.$route.query['rt']
      }
    }
  }
}
</script>
